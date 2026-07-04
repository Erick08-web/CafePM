from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracion(BaseSettings):
    database_url: str = "postgresql+psycopg://coffee_user:coffee_pass@localhost:5432/coffee_code_db"
    jwt_secret_key: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


configuracion = Configuracion()
