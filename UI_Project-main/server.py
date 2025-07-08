from flask import Flask
from flask import render_template, session
from flask import Response, request, jsonify, redirect, url_for
app = Flask(__name__)

map = "https://imgcap.capturetheatlas.com/wp-content/uploads/2022/12/boroughs-of-new-york-city-map.jpg"
app.secret_key = 'secret-key'

# ROUTES
@app.route('/')
def home():
    return render_template("home.html")

@app.route('/next')
def next():
    # I will add the logic later
    pass

@app.route('/back')
def back():
    # I will add the logic later
    pass

@app.route('/harlem-renaissance')
def harlem_renaissance():
    return render_template('harlem_renaissance.html')

@app.route('/harlem-renaissance/harlem')
def harlem():
    return render_template('harlem.html')

@app.route('/harlem-renaissance/harlem_quiz')
def harlem_quiz():
    return render_template('harlem_quiz.html')

@app.route('/punk')
def punk():
    return render_template("punk.html")

@app.route('/punk/cbgb')
def cbgb():
    return render_template("cbgb.html")

@app.route('/the_bronx')
def the_bronx():
     return render_template('the_bronx.html')
 
@app.route('/bronx_quiz')
def bronx_quiz():
     return render_template('bronx_quiz.html')

@app.route('/salsa')
def salsa():
     return render_template('salsa.html')
 
@app.route('/cheetah_club')
def cheetah_club():
     return render_template('cheetah_club.html')

@app.route('/hiphop')
def hiphop():
    return render_template('hiphop.html')

@app.route('/quiz1')
def quiz1():
    session.pop('quiz_results', None)  
    return render_template('quiz1.html')

@app.route('/quiz/2')
def quiz2():
    return render_template('quiz2.html')

@app.route('/quiz/3')
def quiz3():
    return render_template('quiz3.html')

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    quiz_id = data.get('quiz_id')
    answers = data.get('answers')
    score = data.get('score')


    if not quiz_id:
        return jsonify({'status': 'error', 'message': 'Missing quiz_id'}), 400

    current_results = session.get('quiz_results', {})

    if 'quiz_results' not in session:
        session['quiz_results'] = {}

    current_results[quiz_id] = {
        'answers': answers,
        'score': score
    }
    
    session['quiz_results'] = current_results
    session.modified = True
    
    stored = session['quiz_results'][quiz_id]

    if quiz_id == 'quiz1':
        next_url = url_for('quiz2')
    elif quiz_id == 'quiz2':
        next_url = url_for('quiz3')
    else:
        next_url = url_for('results')


    for k, v in session.items():
        print(f"  {k}: {v}")
    

    return jsonify({
        'status': 'ok',
        'next':   next_url, 
        'stored': stored
    })


@app.route('/results')
def results():
    results = session.get('quiz_results', {})
    for k, v in session.items():
        print(f"  {k}: {v}")
    return render_template('results.html', results=results)


if __name__ == "__main__":
    app.run(port=5001)
