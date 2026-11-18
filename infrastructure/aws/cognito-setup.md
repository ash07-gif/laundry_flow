# AWS Cognito Setup

For production authentication, LaundryFlow is configured to use AWS Cognito.

## Steps to configure:

1. **Create a User Pool**
   - Go to AWS Console > Cognito > User Pools
   - Click "Create user pool"
   - Select "Email" as the sign-in option.
   - Set password policy requirements.
   - Configure MFA (optional).
   - Create the User Pool.

2. **Create an App Client**
   - In the User Pool settings, go to "App integration" > "App clients and analytics"
   - Create a new App client (do not generate a client secret for SPAs like React).
   - Enable `ALLOW_USER_PASSWORD_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`.

3. **Configure Environment Variables**
   Once created, add the following to your backend and frontend `.env` files:
   ```env
   # Backend
   AUTH_PROVIDER=cognito
   COGNITO_USER_POOL_ID=us-east-1_XXXXX
   COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXX
   
   # Frontend
   VITE_AUTH_PROVIDER=cognito
   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXX
   VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXX
   ```

## Backend Validation
When `AUTH_PROVIDER=cognito`, the FastAPI backend will automatically validate the incoming JWT signatures against the Cognito JWKS endpoint instead of verifying standard HMAC local tokens.
