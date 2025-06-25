function salvarChaves() {
  const apiKey = document.getElementById('apiKey').value;
  const secretKey = document.getElementById('secretKey').value;
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Você precisa estar logado');
    window.location.href = 'login.html';
    return;
  }

  fetch('http://localhost:3000/api/protected/user/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ apiKey, secretKey })
  })
    .then(res => res.json())
    .then(data => {
      alert('Chaves salvas com sucesso!');
      window.location.href = 'https://modefuck.netlify.app/config'; // 🔁 redireciona para produção
    })
    .catch(() => alert('Erro ao salvar chaves'));
}
