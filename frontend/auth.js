const API_URL = 'http://localhost:3000/api/auth';

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Login bem-sucedido!');
        window.location.href = 'chaves.html'; // Agora redireciona para inserir as chaves da API
      } else {
        alert('Erro ao fazer login. Verifique suas credenciais.');
      }
    })
    .catch(() => alert('Erro na conexão com o servidor.'));
}

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'login.html'; // Redireciona para login após cadastro
    })
    .catch(() => alert('Erro na conexão com o servidor.'));
}

