const STORAGE_KEY = "pacientes";

/* ===============================
   UTIL
================================ */
function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/* ===============================
   SALVAR PACIENTE
================================ */
function salvarPaciente(paciente) {
  const pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  pacientes.push(paciente);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));
}

/* ===============================
   CARREGAR
================================ */
function carregarPacientes() {
  const pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const tbody = document.querySelector("#tabelaPacientes tbody");

  tbody.innerHTML = "";

  pacientes.forEach((paciente, index) => {
    adicionarLinha(paciente, index);
  });
}

/* ===============================
   REMOVER INDIVIDUAL
================================ */
function removerPaciente(index) {
  const pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  pacientes.splice(index, 1);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));

  carregarPacientes();
}

/* ===============================
   ADICIONAR LINHA
================================ */
function adicionarLinha(paciente, index) {
  const tbody = document.querySelector("#tabelaPacientes tbody");
  const tr = document.createElement("tr");

  let checkboxes = "";

  for (let i = 1; i <= 31; i++) {
    const checked = paciente.checklist[i] ? "checked" : "";

    checkboxes += `
      <td>
        <input type="checkbox"
          onchange="toggleCheck(${index}, ${i})"
          ${checked}
        />
      </td>
    `;
  }

  tr.innerHTML = `
    <td><span class="btn-remover" onclick="removerPaciente(${index})">x</span></td>
    <td>${paciente.nome}</td>
    <td>${formatarDataBR(paciente.data)}</td>
    ${checkboxes}
  `;

  tbody.appendChild(tr);
}

/* ===============================
   TOGGLE CHECKBOX
================================ */
function toggleCheck(index, dia) {
  const pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  pacientes[index].checklist[dia] = !pacientes[index].checklist[dia];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));
}

/* ===============================
   FORM
================================ */
document
  .getElementById("formPaciente")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const data = document.getElementById("dataInternacao").value;

    const checklist = {};

    for (let i = 1; i <= 31; i++) {
      checklist[i] = false;
    }

    salvarPaciente({
      nome,
      data,
      checklist,
    });

    carregarPacientes();
    this.reset();
  });

/* ===============================
   LIMPAR TUDO
================================ */
document
  .getElementById("btnLimparTudo")
  .addEventListener("click", function () {
    const confirmar = confirm(
      "Você tem certeza que quer excluir todos os registros?"
    );

    if (!confirmar) return;

    localStorage.removeItem(STORAGE_KEY);

    carregarPacientes();
  });

/* ===============================
   EXPORTAÇÃO
================================ */
document.getElementById("btnExportar").addEventListener("click", function () {
  const pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (pacientes.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const dados = pacientes.map((p) => {
    const linha = {
      Nome: p.nome,
      "Data Internação": formatarDataBR(p.data),
    };

    for (let i = 1; i <= 31; i++) {
      linha[`Dia ${i}`] = p.checklist[i] ? "✔" : "";
    }

    return linha;
  });

  const ws = XLSX.utils.json_to_sheet(dados);

  ws["!pageSetup"] = {
    orientation: "landscape",
    paperSize: 9,
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pacientes");

  XLSX.writeFile(wb, "controle_pacientes.xlsx");
});

/* ===============================
   INIT
================================ */
carregarPacientes();