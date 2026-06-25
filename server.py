from flask import Flask, request, jsonify, send_from_directory
import requests
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# У реальному проекті ці ключі краще брати з файлу .env, використовуючи бібліотеку python-dotenv
# Але для простоти ми можемо вказати їх тут, або зчитати з середовища:
TELEGRAM_BOT_TOKEN = '8944016356:AAEhgrts5aQ4JfBs3FW5_nfjnI2MvYhSQXs'
TELEGRAM_CHAT_ID = '1121951611'

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    data = request.json
    
    name = data.get('name', '')
    phone = data.get('phone', '')
    email = data.get('email', '')
    message = data.get('message', '')
    interest = data.get('interest', 'Не вказано')

    # Формуємо текст повідомлення
    text = f"🔥 <b>Нова заявка з сайту Рудий Кіт!</b>\n\n"
    text += f"🏠 <b>Цікавить:</b> {interest}\n"
    text += f"👤 <b>Ім'я:</b> {name}\n"
    text += f"📞 <b>Телефон:</b> {phone}\n"
    if email:
        text += f"✉️ <b>Email:</b> {email}\n"
    if message:
        text += f"💬 <b>Повідомлення:</b>\n{message}"

    telegram_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'HTML'
    }

    try:
        # verify=False додано через можливі проблеми з SSL сертифікатами на Windows
        response = requests.post(telegram_url, json=payload, verify=False)
        response.raise_for_status() # Перевіряємо, чи немає помилок від Telegram
        return jsonify({"status": "success", "message": "Заявка відправлена!"}), 200
    except requests.exceptions.RequestException as e:
        print(f"Помилка надсилання в Telegram: {e}")
        # Якщо ви ще не вставили токени, це запобігає падінню сервера:
        return jsonify({"status": "error", "message": "Помилка надсилання в Telegram."}), 500

if __name__ == '__main__':
    print("Запуск сервера на http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
