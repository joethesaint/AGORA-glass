"""
risk_formulas.py

Production-ready Python translations of all 21 mathematical formulas from the
Prop Fund Risk Management Specification.

This is the ORIGINAL standalone-function module written before the project
pivoted to the BaseWorker/MessageBus event-driven architecture (see
src/risk_engine/). It is kept as a top-level reference module because the
formulas here are still cited by the worker classes (e.g.
risk_engine.exposure.risk_metrics.RiskCalculator re-implements formulas 2-4
inline rather than importing this module directly - see that file's own
docstring). It is NOT currently imported/wired into the worker classes.

Libraries required:
    numpy, scipy, pandas, statsmodels, arch, hmmlearn, scikit-learn
"""

import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import minimize
import statsmodels.api as sm
from statsmodels.tsa.stattools import adfuller
from arch import arch_model
from hmmlearn import hmm
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

# ----------------------------------------------------------------------
# MODULE 1: EXPOSURE ENGINE
# ----------------------------------------------------------------------

# Formula 1: Net exposure per instrument
# Q_i = Sum_k eps_k * q_{k,i}
def net_exposure_per_instrument(
    trader_positions: np.ndarray,        # shape (n_traders, n_instruments)
    trader_directions: np.ndarray,       # shape (n_traders,), +1 for long, -1 for short
    firm_side_flip: bool = True
) -> np.ndarray:
    """
    Aggregate all trader positions into the firm's net exposure per instrument.

    trader_positions[k, i] : notional size of trader k in instrument i (always positive)
    trader_directions[k]   : +1 if trader is long, -1 if short

    If firm_side_flip = True, the firm takes the opposite side of every client trade.
    """
    if firm_side_flip:
        # Firm is counterparty: client long -> firm short
        firm_side = -trader_directions
    else:
        firm_side = trader_directions

    # Multiply each trader's size by their signed direction from firm's perspective
    signed_exposures = trader_positions * firm_side[:, np.newaxis]
    net_exposure = np.sum(signed_exposures, axis=0)   # shape (n_instruments,)
    return net_exposure

# Example usage:
# trader_positions = np.array([[100000, 50000], [200000, 0]])  # 2 traders, 2 instruments
# trader_directions = np.array([1, -1])  # trader0 long, trader1 short
# net = net_exposure_per_instrument(trader_positions, trader_directions)
# # For instrument0: trader0 long 100k -> firm short -100k; trader1 short 200k -> firm long +200k => net +100k


# Formula 2: Portfolio variance (Markowitz)
# sigma_p^2 = w' Sigma w
def portfolio_variance(
    weights: np.ndarray,                 # shape (n_instruments,)
    cov_matrix: np.ndarray               # shape (n_instruments, n_instruments)
) -> float:
    """
    Compute variance of the firm's net exposure portfolio.
    weights : notional exposures (in base currency) for each instrument
    cov_matrix : covariance matrix of instrument returns (e.g., daily % changes)
    """
    return weights @ cov_matrix @ weights

# Example:
# weights = np.array([1e6, -5e5])  # long 1M EURUSD, short 500k GBPUSD
# cov = np.array([[0.0001, 0.00005], [0.00005, 0.0002]])
# var = portfolio_variance(weights, cov)  # ~= 220.0


# Formula 3: Value-at-Risk (three variants)
def var_parametric(
    portfolio_value: float,
    volatility: float,                   # annualised vol of portfolio returns
    confidence: float = 0.95,
    horizon_days: float = 1.0
) -> float:
    """
    Parametric VaR assuming normally distributed returns.
    volatility : standard deviation of portfolio returns (e.g., from GARCH)
    """
    z_score = stats.norm.ppf(1 - confidence)
    var = portfolio_value * volatility * np.sqrt(horizon_days / 252) * z_score
    return abs(var)   # VaR is usually reported as a positive loss amount

def var_historical(
    pnl_history: np.ndarray,              # historical P&L changes (e.g., daily)
    confidence: float = 0.95
) -> float:
    """Historical simulation VaR."""
    return abs(np.percentile(pnl_history, 100 * (1 - confidence), method='lower'))

def var_monte_carlo(
    initial_value: float,
    mu: float,                            # expected return
    sigma: float,                         # volatility
    n_sims: int = 10000,
    confidence: float = 0.95,
    horizon_days: float = 1.0
) -> float:
    """Monte Carlo VaR with geometric Brownian motion."""
    dt = horizon_days / 252
    returns = np.random.normal(
        (mu - 0.5 * sigma**2) * dt,
        sigma * np.sqrt(dt),
        n_sims
    )
    simulated_values = initial_value * np.exp(returns)
    losses = initial_value - simulated_values
    return abs(np.percentile(losses, 100 * (1 - confidence)))


# Formula 4: Expected Shortfall (CVaR)
def expected_shortfall(
    pnl_history: np.ndarray,
    var_threshold: float,
    confidence: float = 0.95
) -> float:
    """
    Expected Shortfall (ES) from historical P&L.
    var_threshold : the VaR level computed on the same data.
    """
    # Losses beyond VaR (remember P&L negative = loss)
    tail_losses = pnl_history[pnl_history <= -var_threshold]
    if len(tail_losses) == 0:
        return var_threshold
    return abs(np.mean(tail_losses))

def compute_expected_shortfall_parametric(
    portfolio_value: float,
    volatility: float,
    confidence: float = 0.9,
    horizon_days: float = 1.0,
) -> float:
    """Parametric Expected Shortfall (CVaR) assuming normality.
    Parameters
    ----------
    portfolio_value : float
        Current portfolio value (base currency)
    volatility : float
        Volatility of portfolio returns.
    confidence : float
        Confidence level.

    Returns
    -------
    float
        Absolute Expected Shortfall (positive loss)
    """
    z = stats.norm.ppf(1 - confidence)
    scaled_vol = volatility * np.sqrt(horizon_days)
    es_factor = stats.norm.pdf(z) / (1 - confidence)
    return float(portfolio_value * scaled_vol * es_factor)


# ----------------------------------------------------------------------
# MODULE 2: TRADER CLASSIFICATION & TOXIC FLOW DETECTION
# ----------------------------------------------------------------------

# Formula 5: Markout analysis
def compute_markout(
    trade_price: float,
    future_price: float,
    direction: int,                       # +1 for buy, -1 for sell
) -> float:
    """
    Markout P&L for a single trade.
    direction : from client's perspective (+1 long, -1 short)
    """
    return round(direction * (future_price - trade_price), 12)

def compute_markouts_batch(
    trade_prices: np.ndarray,             # shape (n_trades,)
    future_prices: np.ndarray,            # shape (n_trades,) at horizon delta
    directions: np.ndarray                # shape (n_trades,) +1/-1
) -> np.ndarray:
    """Vectorised markout for many trades."""
    return directions * (future_prices - trade_prices)

# Example:
# trades = np.array([1.1000, 1.1010])
# future = np.array([1.1010, 1.1005])
# dirs = np.array([1, -1])   # first trade buy, second sell
# markouts = compute_markouts_batch(trades, future, dirs)  # [0.0010, 0.0005]


# Formula 6: VPIN (Volume-Synchronized Probability of Informed Trading)
def compute_vpin(
    buy_volume: np.ndarray,               # per volume bucket
    sell_volume: np.ndarray,              # per volume bucket
    bucket_size: float,                   # constant volume per bucket (e.g., 1M)
    n_buckets: int = 50                   # rolling window
) -> float:
    """
    VPIN = Sum|V^B - V^S| / (n * V_bucket)
    Returns a value between 0 and 1; >0.7 indicates toxic flow.
    """
    # Use the last n_buckets
    buy = buy_volume[-n_buckets:]
    sell = sell_volume[-n_buckets:]
    numerator = np.sum(np.abs(buy - sell))
    denominator = n_buckets * bucket_size
    return numerator / denominator

# For real-time, you maintain a deque of bucket imbalances.


# Formula 7: Trader Sharpe Ratio (rolling)
def trader_sharpe(
    trade_pnls: np.ndarray                 # P&L of each trade by this trader
) -> float:
    """Sharpe ratio based on per-trade returns (assuming zero risk-free rate)."""
    if len(trade_pnls) < 5:
        return 0.0
    return np.mean(trade_pnls) / (np.std(trade_pnls) + 1e-9)


# Formula 8: Proportion of sharp/toxic trades
def proportion_toxic_trades(
    toxicity_labels: np.ndarray            # boolean array (True = toxic)
) -> float:
    """pi_k = #toxic / total trades"""
    if len(toxicity_labels) == 0:
        return 0.0
    return np.sum(toxicity_labels) / len(toxicity_labels)


# Formula 9: PULSE toxicity probability (simplified MVP version)
def build_pulse_classifier_simple():
    """
    Returns a scikit-learn pipeline that predicts toxicity probability per trade.
    In production you replace this with the PyTorch Bayesian NN.
    """
    from sklearn.pipeline import make_pipeline
    from sklearn.ensemble import GradientBoostingClassifier

    model = make_pipeline(
        StandardScaler(),
        GradientBoostingClassifier(n_estimators=100, max_depth=3)
    )
    return model

# Features for PULSE (example for a single trade):
# - Spread at trade time (bps)
# - Volatility (ATR %)
# - Order book imbalance
# - Trader's rolling markout (60s)
# - Trader's win rate last 20 trades
# - Trade size relative to average
# - Time since last trade
# - News flag (0/1)

# After training on labelled data (toxic = markout > 0 after 60s):
# pulse_model = build_pulse_classifier_simple()
# pulse_model.fit(X_train, y_train)
# prob_toxic = pulse_model.predict_proba(X_live)[0, 1]


# ----------------------------------------------------------------------
# MODULE 3: MARKET REGIME DETECTION
# ----------------------------------------------------------------------

# Formula 10: Hidden Markov Model regime detection
def fit_regime_hmm(
    returns: np.ndarray,                   # shape (n_obs,)
    n_states: int = 2,
    n_iter: int = 100
) -> tuple:
    """
    Fit a Gaussian HMM on daily/intraday returns.
    Returns (model, hidden_states, state_means, state_vars)
    """
    model = hmm.GaussianHMM(
        n_components=n_states,
        covariance_type="diag",
        n_iter=n_iter,
        random_state=42
    )
    X = returns.reshape(-1, 1)
    model.fit(X)
    hidden_states = model.predict(X)
    # Extract means and variances per state
    state_means = model.means_.flatten()
    state_vars = np.sqrt(model.covars_.flatten())
    return model, hidden_states, state_means, state_vars

# Example:
# rets = np.random.randn(1000) * 0.01
# model, states, means, vols = fit_regime_hmm(rets, n_states=2)
# current_regime = states[-1]  # 0 = low vol / mean-reverting, 1 = high vol / trending


# Formula 11: Hurst exponent (R/S method)
def hurst_exponent(ts: np.ndarray, lags: np.ndarray = None) -> float:
    """
    Compute Hurst exponent H using rescaled range analysis.
    H < 0.5 : mean-reverting
    H = 0.5 : random walk
    H > 0.5 : trending
    """
    ts = np.asarray(ts)
    if lags is None:
        lags = np.unique(np.logspace(1, np.log10(len(ts)//4), 15, dtype=int))

    rs_values = []
    for lag in lags:
        # Split series into chunks of length 'lag'
        chunks = np.array_split(ts, len(ts)//lag)
        r_over_s = []
        for chunk in chunks:
            if len(chunk) < 4:
                continue
            # Cumulative deviations from mean
            mean = np.mean(chunk)
            deviate = chunk - mean
            Z = np.cumsum(deviate)
            R = np.max(Z) - np.min(Z)
            S = np.std(chunk, ddof=1)
            if S > 0:
                r_over_s.append(R / S)
        if r_over_s:
            rs_values.append((lag, np.mean(r_over_s)))

    lags_arr = np.array([x[0] for x in rs_values])
    rs_arr = np.array([x[1] for x in rs_values])
    # Linear fit in log-log space: log(R/S) = H * log(lag) + const
    H = np.polyfit(np.log(lags_arr), np.log(rs_arr), 1)[0]
    return H

# Example: H = hurst_exponent(price_series.pct_change().dropna())


# Formula 12: Augmented Dickey-Fuller test for stationarity
def test_mean_reversion_adf(price_series: np.ndarray, regression: str = 'c') -> dict:
    """
    Perform ADF test.
    regression : 'c' for constant, 'ct' for constant+trend, 'nc' for none
    Returns dict with test statistic, p-value, and critical values.
    """
    result = adfuller(price_series, regression=regression, autolag='AIC')
    return {
        'adf_stat': result[0],
        'p_value': result[1],
        'critical_values': result[4],
        'is_stationary': bool(result[1] < 0.05)   # reject unit root -> mean-reverting
    }

test_mean_reversion_adf.__test__ = False


# Formula 13: GARCH(1,1) volatility forecast
def fit_garch_volatility(
    returns: np.ndarray,                   # percentage returns (e.g., 0.5 for 0.5%)
    horizon: int = 1
) -> float:
    """
    Fit GARCH(1,1) and return forecast volatility for next horizon.
    Returns annualised volatility (decimal, e.g., 0.12 for 12%)
    """
    # Scale returns to percentage for numerical stability
    scaled_returns = returns * 100
    model = arch_model(scaled_returns, vol='Garch', p=1, q=1, dist='normal')
    fitted = model.fit(disp='off')
    forecast = fitted.forecast(horizon=horizon)
    # Extract conditional variance for next step, convert back to decimal and annualise
    cond_var = forecast.variance.values[-1, -1] / 10000   # undo scaling
    annual_vol = np.sqrt(cond_var * 252)
    return annual_vol

# Example:
# daily_rets = np.array([0.001, -0.002, 0.0005, ...])
# vol = fit_garch_volatility(daily_rets)  # ~0.15 for 15% annual vol


# Formula 14: Ornstein-Uhlenbeck parameter estimation
def fit_ornstein_uhlenbeck(price_series: np.ndarray, dt: float = 1.0) -> dict:
    """
    Estimate theta (mean-reversion speed), mu (long-term mean), sigma (volatility)
    using OLS regression on discretised OU process:
        X_{t+1} - X_t = theta * mu * dt - theta * X_t * dt + sigma * dW
    """
    X = price_series
    y = np.diff(X)
    X_lag = X[:-1]

    # Regression: y = a + b * X_lag + eps
    X_design = sm.add_constant(X_lag)
    model = sm.OLS(y, X_design).fit()
    b = model.params[1]          # -theta * dt
    a = model.params[0]          # theta * mu * dt
    resid_std = np.std(model.resid)

    theta = -b / dt
    mu = a / (theta * dt) if theta != 0 else np.mean(X)
    sigma = resid_std / np.sqrt(dt)

    return {'theta': theta, 'mu': mu, 'sigma': sigma, 'half_life': np.log(2)/theta if theta > 0 else np.inf}


# Formula 15: Variance Ratio test (Lo-MacKinlay)
def variance_ratio_test(returns: np.ndarray, k: int = 2) -> dict:
    """
    VR(k) = Var(r_k) / (k * Var(r_1))
    Under null of random walk, VR=1.
    """
    if not isinstance(returns, pd.Series):
        returns = pd.Series(returns)
    n = len(returns)
    r_k = returns.rolling(k).sum().dropna().values
    var_k = np.var(r_k, ddof=1)
    var_1 = np.var(returns, ddof=1)
    vr = var_k / (k * var_1)

    # Asymptotic variance of VR under homoskedasticity
    se = np.sqrt(2 * (2*k - 1) * (k - 1) / (3 * k * n))
    z_stat = (vr - 1) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
    return {'vr': vr, 'z_stat': z_stat, 'p_value': p_value}


# Formula 16: Composite regime score
def composite_regime_score(
    hmm_state: int,                        # 0=mean-rev, 1=trending (or vice versa)
    hurst: float,
    adf_pvalue: float,
    garch_vol: float,
    weights: tuple = (0.3, 0.3, 0.2, 0.2)
) -> float:
    """
    Combine multiple regime indicators into a single score in [-1, +1].
    +1 = strongly trending; -1 = strongly mean-reverting.
    """
    # Map each indicator to [-1, 1]
    # HMM: assume state 1 = trending
    hmm_score = 2 * hmm_state - 1

    # Hurst: scale from [0,1] to [-1,1] with 0.5 mapping to 0
    hurst_score = np.clip((hurst - 0.5) * 4, -1, 1)

    # ADF p-value: low p-value = mean-reverting (negative score)
    adf_score = -np.clip(1 - adf_pvalue * 20, -1, 1)

    # Volatility: high vol often coincides with trends; map to [0,1] then shift
    vol_score = np.clip((garch_vol - 0.10) / 0.20, -1, 1)

    composite = (weights[0] * hmm_score +
                 weights[1] * hurst_score +
                 weights[2] * adf_score +
                 weights[3] * vol_score)
    return np.clip(composite, -1, 1)


# ----------------------------------------------------------------------
# MODULE 4: HEDGING DECISION ENGINE
# ----------------------------------------------------------------------

# Formula 17: Reservation price (Avellaneda-Stoikov)
def reservation_price(
    mid_price: float,
    inventory: float,                      # signed quantity (+ long, - short)
    risk_aversion: float,                  # gamma (typically 0.1 to 1.0)
    volatility: float,                     # annualised sigma
    time_remaining: float                  # T - t in years
) -> float:
    """
    r = S - q * gamma * sigma^2 * (T - t)
    The price at which the firm is indifferent to holding the inventory.
    """
    return mid_price - inventory * risk_aversion * (volatility ** 2) * time_remaining


# Formula 18: Optimal spread (Avellaneda-Stoikov)
def optimal_spread(
    risk_aversion: float,
    volatility: float,
    time_remaining: float,
    liquidity_param: float                 # kappa (order book depth)
) -> float:
    """
    delta* = gamma sigma^2 (T - t) + (2/gamma) ln(1 + gamma/kappa)
    The minimum spread to charge for taking inventory risk.
    """
    term1 = risk_aversion * (volatility ** 2) * time_remaining
    term2 = (2 / risk_aversion) * np.log(1 + risk_aversion / liquidity_param)
    return term1 + term2


# Formula 19: Optimal hedge rate (Cartea-Sanchez-Betancourt)
def optimal_hedge_rate(
    Q_broker: float,                       # current inventory
    Q_informed: float,                     # estimated informed inventory
    alpha_hat: float,                      # trend signal extracted from informed flow
    nu_uninformed: float,                  # rate of uninformed trading
    coefficients: tuple = (1.0, 0.8, 0.5, 0.2)   # c1..c4
) -> float:
    """
    Linear policy: hedge_rate = c1*Q + c2*Q_inf + c3*alpha + c4*nu
    Positive hedge_rate means sell to reduce long exposure.
    """
    c1, c2, c3, c4 = coefficients
    return c1 * Q_broker + c2 * Q_informed + c3 * alpha_hat + c4 * nu_uninformed


# Formula 20: PULSE-driven internalise/externalise decision
def should_internalise_trade(
    toxicity_prob: float,                  # from PULSE model
    base_threshold: float,                 # p (e.g., 0.3)
    inventory: float,                      # current net exposure in this instrument
    phi: float = -1e-7                     # inventory aversion parameter
) -> bool:
    """
    Internalise if p_toxic < threshold + phi * |Q|
    phi negative makes us more willing to externalise when inventory is large.
    """
    threshold = base_threshold + phi * abs(inventory)
    return toxicity_prob < threshold


# Formula 21: Kelly criterion for hedge sizing
def kelly_hedge_fraction(
    win_probability: float,                # p (probability hedge is needed)
    payoff_ratio: float,                   # b (win/loss ratio)
    fractional: float = 0.5                # use half-Kelly for safety
) -> float:
    """
    f* = (p*b - q) / b
    Returns fraction of exposure to hedge.
    """
    q = 1 - win_probability
    full_kelly = (win_probability * payoff_ratio - q) / payoff_ratio
    # Kelly can be negative if edge is against you
    full_kelly = max(0.0, full_kelly)
    return round(fractional * full_kelly, 12)


# ----------------------------------------------------------------------
# ORCHESTRATOR (pseudo-code skeleton, illustrative only - not runnable as-is;
# left exactly as it appeared in the original transcript)
# ----------------------------------------------------------------------
def risk_management_tick(
    trader_positions, trader_directions,
    mid_prices, cov_matrix, price_history,
    trade_features, toxicity_model
):
    """
    This function would be called on every market data tick or trade event.
    It wires together all 21 formulas in the correct sequence.

    NOTE: this references undefined names (`instruments`, `new_trades`,
    `route_to_hedge`) - it is a conceptual skeleton from the original design
    discussion, not executable code. The real, working pipeline is the
    event-driven worker architecture under src/risk_engine/.
    """
    # 1. Exposure aggregation (F1, F2)
    net_exposure = net_exposure_per_instrument(trader_positions, trader_directions)
    portfolio_risk = portfolio_variance(net_exposure, cov_matrix)

    # 2. Regime detection per instrument (F10-F16)
    for instr in instruments:
        rets = price_history[instr].pct_change().dropna()
        _, states, _, _ = fit_regime_hmm(rets.values)
        current_regime = states[-1]
        H = hurst_exponent(rets.values)
        adf_res = test_mean_reversion_adf(price_history[instr].values)
        vol = fit_garch_volatility(rets.values)
        regime_score = composite_regime_score(current_regime, H, adf_res['p_value'], vol)

    # 3. Trader toxicity (F5-F9)
    for trade in new_trades:
        prob_toxic = toxicity_model.predict_proba(trade.features)[0, 1]
        internalise = should_internalise_trade(prob_toxic, base_threshold=0.25, inventory=net_exposure[trade.instr])
        if not internalise:
            route_to_hedge(trade)

    # 4. Hedge decision (F17-F21)
    #    - Use reservation price to set hedge limit orders
    #    - Kelly fraction to size the hedge
    #    - Cartea policy to determine hedge rate
