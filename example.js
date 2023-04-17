async function getData() {
  return await (
    await fetch('https://jsonplaceholder.typicode.com/posts')
  ).json()
}

function transformData(result) {
  return result.map(item => {
    const arr = Object.values(item)
    const valor = arr.splice(1, 1)[0];
    arr.splice(0, 0, valor);
    return arr
  })
}


(async() => {
  const data = await transformData(await getData())
  const totalRows = data.length
  const tableUI = new TableUI('myTable')
  tableUI.create({ data, totalRows })
})()
