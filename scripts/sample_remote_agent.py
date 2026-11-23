from aiohttp import web
import json
import logging

# Simple Remote Agent Example
# Demonstrates how a third-party can provide 'Alpha-as-a-Service' to the AGORA framework.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RemoteAlphaProvider")

async def handle_evaluate(request):
    """
    Standard AGORA Agent API endpoint.
    Receives PositionUpdate data, returns RiskVerdict logic.
    """
    try:
        data = await request.json()
        symbol = data.get("symbol")
        margin = data.get("margin_ratio", 1.0)
        
        logger.info(f"Evaluating {symbol} | Margin: {margin:.4f}")
        
        # PROPRIETARY ALPHA LOGIC (Example)
        # Instead of 12% safety bands, this agent is very aggressive
        if margin < 0.05:
            response = {"status": "CRITICAL", "risk_rating": 5}
        elif margin < 0.10:
            response = {"status": "WARNING", "risk_rating": 3}
        else:
            response = {"status": "SAFE", "risk_rating": 1}
            
        return web.Response(text=json.dumps(response), content_type='application/json')

    except Exception as e:
        return web.Response(status=400, text=str(e))

app = web.Application()
app.add_routes([web.post('/evaluate', handle_evaluate)])

if __name__ == '__main__':
    print("🚀 AGORA Remote Agent started on http://localhost:9000")
    web.run_app(app, port=9000)
