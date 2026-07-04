from pydantic_settings import BaseSettings


class Configuracion(BaseSettings):
    database_url: str
    jwt_secret_key: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    class Config:
        env_file = ".env"


configuracion = Configuracion()
