async function carregarConfiguracoes() {
  const token = localStorage.getItem('token');
  if (!token) return alert('Você precisa estar logado.');

  try {
    const res = await fetch('http://localhost:3000/api/protected/config', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const config = await res.json();

    document.getElementById('botAtivo').checked = config.botActive;
    document.getElementById('risco').value = config.riskManagement.riskPerTrade;
    document.getElementById('tp').value = config.riskManagement.takeProfit;
    document.getElementById('sl').value = config.riskManagement.stopLoss;

    const moedasDiv = document.getElementById('moedas');
    moedasDiv.innerHTML = '';

    for (const par in config.pairs) {
      const info = config.pairs[par];
      const html = `
        <div class="pair-item">
          <label>
            <input type="checkbox" data-par="${par}" ${info.active ? 'checked' : ''}/>
            ${par} (Leverage: ${info.leverage}x)
          </label>
        </div>
      `;
      moedasDiv.innerHTML += html;
    }
  } catch (e) {
    console.error(e);
    alert('Erro ao carregar as configurações');
  }
}

async function salvarConfiguracoes() {
  const token = localStorage.getItem('token');
  if (!token) return alert('Você precisa estar logado.');

  const paresInputs = document.querySelectorAll('#moedas input[type="checkbox"]');
  const pairs = {};
  paresInputs.forEach(input => {
    const par = input.getAttribute('data-par');
    const ativo = input.checked;
    const leverageText = input.parentElement.innerText;
    const leverage = parseInt(leverageText.match(/Leverage: (\d+)x/)[1]);
    pairs[par] = { active: ativo, leverage };
  });

  const body = {
    botActive: document.getElementById('botAtivo').checked,
    pairs,
    riskManagement: {
      riskPerTrade: parseFloat(document.getElementById('risco').value),
      takeProfit: parseFloat(document.getElementById('tp').value),
      stopLoss: parseFloat(document.getElementById('sl').value)
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/protected/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    alert(result.message || 'Configurações salvas!');
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar');
  }
}

carregarConfiguracoes();
