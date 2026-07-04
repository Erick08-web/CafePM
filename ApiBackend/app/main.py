from fastapi import FastAPI

app = FastAPI(
    title="Coffee Code API",
    description="API para cafeteria: web admin, cocina, caja y mesero.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "project": "Coffee Code"}
