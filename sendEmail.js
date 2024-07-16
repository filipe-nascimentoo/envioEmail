require('dotenv').config();
const nodemailer = require('nodemailer');
const mysql = require('mysql');

// Crie uma conexão com o banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conecte ao banco de dados
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao banco de dados.');
});

// Crie um transporte utilizando o serviço de e-mail do Hotmail/Outlook e suas credenciais
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL, // Seu e-mail do Hotmail
    pass: process.env.EMAIL_PASSWORD // Sua senha do Hotmail
  }
});

// Função para obter destinatários do banco de dados
const getRecipients = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT email FROM pessoa'; // Altere para a sua tabela e campo de e-mail
    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }
      const emails = results.map(row => row.email);
      resolve(emails);
    });
  });
};

// Envie o e-mail
const sendEmail = async () => {
  try {
    const recipients = await getRecipients();
    const mailOptions = {
      from: process.env.EMAIL, // Endereço de e-mail do remetente
      to: recipients.join(', '), // Endereços de e-mail dos destinatários separados por vírgula
      subject: 'Teste de Envio de e-mail em massa',
      //text: 'Corpo do e-mail em texto simples',
      // Você pode adicionar um corpo HTML se preferir
      html: `<h1>Teste</h1>
            <h2>O primeiro e-mail em massa com HTML</h2>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('E-mail enviado: ' + info.response);
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  } finally {
    // Feche a conexão com o banco de dados
    db.end();
  }
};

sendEmail();