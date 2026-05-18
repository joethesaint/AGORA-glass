import os
import logging
from circle.web3 import utils
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("RegisterSecret")

load_dotenv()

def register_secret():
    api_key = os.getenv("CIRCLE_API_KEY")
    
    if not api_key:
        logger.error("CIRCLE_API_KEY not found in .env. Please provide it before running this script.")
        return

    logger.info("Generating new entity secret...")
    entity_secret = utils.generate_entity_secret()
    
    # NOTE TO USER: Securely save this locally until you can add to .env
    print(f"--- GENERATED SECRET ---")
    print(f"ENTITY_SECRET={entity_secret}")
    print("--- PLEASE COPY AND SAVE THIS SECRET SECURELY IMMEDIATELY ---")

    logger.info("Registering entity secret with Circle...")
    try:
        # Register and download recovery file
        recovery_path = "./recovery"
        if not os.path.exists(recovery_path):
            os.makedirs(recovery_path)
            
        result = utils.register_entity_secret_ciphertext(
            api_key=api_key,
            entity_secret=entity_secret,
            recoveryFileDownloadPath=recovery_path,
        )
        
        logger.info(f"Registration successful! Recovery file saved to: {recovery_path}")
        print(f"Result: {result}")
        print("IMPORTANT: Store the ENTITY_SECRET in your .env file and securely back up the recovery file.")

    except Exception as e:
        logger.error(f"Failed to register entity secret: {e}")

if __name__ == "__main__":
    register_secret()
