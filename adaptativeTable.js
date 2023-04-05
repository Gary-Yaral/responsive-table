function globalUI(table, tbody) {
  let thead = document.querySelector("thead");
  let trThead = thead.querySelector("tr");
  let container = table.parentNode;

  let biggest = 0;
  const offSets = {};
  const thArray = [];
  const rows = {};
  let previousWidth = container.offsetWidth;

  getOffSets();
  loadedTable();

  window.addEventListener("resize", renderize);

  function getOffSets() {
    let ths = trThead.querySelectorAll("th");
    ths.forEach((ths, i) => {
      offSets[i] = ths.offsetWidth;
    });

    biggest = Object.values(offSets).sort((a, b) => b - a)[0]
  }

  function loadedTable() {
    renderize();
    let ths = trThead.querySelectorAll("th");

    while (isBigger(ths)) {
      renderize();
      ths = trThead.querySelectorAll("th");
    }
  }

  function renderize() {
    let ths = thead.querySelectorAll("th");
    let trs = tbody.querySelectorAll("tr");
    let containerWidth = container.offsetWidth;

    if (isBigger(ths) && ths.length > 0) {
      hideColumns(ths, trs);
    } else {
      const hasRows = Object.keys(rows).length > 0;
      const hasThs = thArray.length > 0;
      const canShow = hasRows && hasThs && isExpanding();

      if (canShow) {
        showColumns(thArray, containerWidth, trs, ths);
      }
    }
  }

  function hideColumns(ths, trs) {
    let lastTh = ths[ths.length - 1];
    thArray.push({ th: lastTh });
    const hasNewRows = Object.keys(rows).length > 0;

    if (!hasNewRows) {
      for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tds = tr.querySelectorAll("td");
        let lastIndex = tds.length - 1;
        let lastTd = tds[lastIndex];
        let content = lastTd.innerHTML;
        let colspan = ths.length - 1;

        if (!rows[i]) {
          rows[i] = [lastTd];
          let newRow = tbody.insertRow(i * 2 + 1);
          newRow.classList.add("tr-new");
          newRow.classList.add("hidden");
          newRow.appendChild(templateTD(lastTh.innerHTML, content, colspan));
          tds[0].querySelector("span").classList.remove("hidden");
        } else {
          rows[i].push(lastTd);
        }

        lastTd.remove();
      }
    }

    if (hasNewRows) {
      for (let i = 0; i < trs.length; i += 2) {
        let tr = trs[i];
        let tds = tr.querySelectorAll("td");
        let lastIndex = tds.length - 1;
        let lastTd = tds[lastIndex];
        let content = lastTd.innerHTML;
        let li = templateLi(lastTh.innerHTML, content);
        let loadedTd = trs[i + 1].querySelector("td");
        let ul = loadedTd.querySelector("ul");
        ul.insertBefore(li, ul.firstChild);
        rows[i / 2].push(lastTd);
        lastTd.remove();
      }
    }

    lastTh.remove();
  }

  function showColumns(thArray, containerWidth, trs, ths) {
    let lastColumn = thArray[thArray.length - 1];
    let widthTds = biggest;
    for (let i = 0; i <= ths.length; i++) {
      widthTds += offSets[i];
    } 

    if (containerWidth > widthTds) {
      for (let i = 0; i < trs.length; i += 2) {
        let tr = trs[i];
        let lastSaved = rows[i / 2].length - 1;
        tr.append(rows[i / 2][lastSaved]);
        rows[i / 2].pop();

        let nextRow = trs[i + 1].querySelector("td");
        let ul = nextRow.querySelector("ul");
        let list = ul.querySelectorAll("li");
        let lastTdNext = list[0];
        lastTdNext.remove();

        if (thArray.length - 1 === 0) {
          nextRow.remove();
          trs[i + 1].remove();
          delete rows[i / 2];
        }

        if (!rows[0]) {
          let tds = tr.querySelectorAll("td");
          tds[0].querySelector("span").classList.remove("red");
          tds[0].querySelector("span").classList.add("hidden");
        }
      }

      trThead.append(lastColumn.th);
      thArray.pop();
    }
  }

  function isBigger(ths) {
    let containerWidth = container.offsetWidth;
    let width = biggest;

    for (let i = 0; i < ths.length; i++) {
      width += offSets[i];
    }

    return width > containerWidth;
  }

  function isExpanding() {
    let increment = false;
    if (previousWidth < container.offsetWidth) {
      increment = true;
    }
    previousWidth = container.offsetWidth;

    return increment;
  }

  function templateTD(title, content, colspan) {
    const template = document.createElement("td");
    template.setAttribute("colspan", colspan);
    template.innerHTML = `
    <ul>
      <li>
        <strong>${title}</strong>
        ${content}
      </li>
    </ul>
  `;
    return template;
  }

  function templateLi(title, content) {
    const template = document.createElement("li");
    template.innerHTML = `
    <strong>${title}</strong>
    ${content}
  `;
    return template;
  }
}

// Class initializer
class TableUI {
  table = "";
  tbody = "";
  adaptative;
  pages = 0;
  perPage = 5;
  constructor(tableID) {
    this.table = document.getElementById(tableID);
    this.tbody = this.table.querySelector("tbody");
  }

  create(props) {
    this.loadData(props.data)
    this.onClick()
    this.loadFooter()
    globalUI(this.table, this.tbody)
    if(props.perPage && props.perPage > 5) {
      this.perPage = props.perPage
    }
  }

  loadData(data) {
    data.forEach((info, i) => {
      let tr = document.createElement("tr");
      let trId = `tr-${i}`;
      tr.setAttribute("id", trId);
      if (i % 2 === 0) {
        tr.classList.add("tr-even");
      } else {
        tr.classList.add("tr-odd");
      }

      info.forEach((text, j) => {
        let td = document.createElement("td");
        if (j === 0) {
          td.innerHTML += `<span class="btn-open-plus hidden" trId="${trId}">+</span>`;
        }
        td.style.width = (1 / info.length) * 100 + "%";
        td.innerHTML += text;
        tr.appendChild(td);
      });

      this.tbody.appendChild(tr);
    });
    this.pages = this.getTotalPages(this.perPage, data.length)
  }

  loadFooter() {
    let ths = this.table.querySelectorAll('th')
    const footer = this.table.createTFoot();
    const row = footer.insertRow();
    const td = row.insertCell();
    td.classList.add('footer-ui')
    td.innerHTML= `Paginas totales ${this.pages}`
    console.log( ths.length);
    td.setAttribute('colspan', ths.length)
  }

  createBtnPages() {

  }

  getTotalPages(perPage, total) {
    let round = total % perPage
    let pages = total / perPage
    const isMinor = total <= perPage
    if(isMinor) return 1
    if(round > 0) {
      pages = parseInt(pages) + 1
    }
    return pages
  }

  onClick() {
    this.tbody.onclick = (e) => {
      let trId = e.target.getAttribute("trId");
      if (trId) {
        let row = document.getElementById(trId);
        e.target.classList.toggle("red");
        row.nextSibling.classList.toggle("hidden");
      }
    };
  }
}


