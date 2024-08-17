const CDP = require('chrome-remote-interface')

async function example() {
  let client
  try {
    // Conectarse al navegador
    client = await CDP()

    // Destructuración de las APIs necesarias
    const { Network, Page, Runtime } = client

    // Habilitar redes y páginas
    await Network.enable()
    await Page.enable()

    // Navegar a una página web
    await Page.navigate({ url: 'https://example.com' })
    await Page.loadEventFired()

    // Ejecutar código JavaScript en la página
    const result = await Runtime.evaluate({
      expression: 'document.title',
    })

    console.log('Título de la página:', result.result.value)

    // Cambiar el fondo de la página
    await Runtime.evaluate({
      expression: 'document.body.style.backgroundColor = "lightblue";',
    })
  } catch (err) {
    console.error(err)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

example()
