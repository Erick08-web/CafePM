from flask import Flask, render_template

app = Flask(__name__)


@app.get("/")
def inicio():
    return render_template("inicio.html", nombre_proyecto="Coffee Code")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
