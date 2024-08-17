import { setTimeout } from 'node:timers/promises'
import { Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
const fs = require('fs')
const fastcsv = require('fast-csv')
// Or import puppeteer from 'puppeteer-core';

interface IHorario {
  seccion: string
  hora: string
  docente: string
  numeroMatriculados: string
}

interface IPack {
  escuela: string
  semestre: string
  curso: string
}

interface IScrap {
  escuela: string
  semestre: string
  curso: string
  seccion: string
  docente: string
  diaHora: string
  numeroMatriculados: string
}

const data: IScrap[] = []

puppeteer
  .use(StealthPlugin())
  .launch({
    headless: false,
    defaultViewport: null,
    userDataDir:
      'C:/Users/ASUS/AppData/Local/Google/Chrome/User Data/Profile 1',
  })
  .then(async (browser) => {
    const page = await browser.newPage()
    await page.goto('https://webapp.ucsm.edu.pe/sm/Views/login.php')

    await setTimeout(5000)
    await page.waitForSelector('#myButton')
    await setTimeout(5000)
    await page.click('#myButton')

    // await page.waitForSelector('#i0116') // Selector del input
    // await setTimeout(3000)
    // await page.type('#i0116', '70004725@ucsm.edu.pe', { delay: 300 })
    // await setTimeout(3000)
    // await page.waitForSelector('#idSIButton9')
    // await setTimeout(3000)
    // await page.click('#idSIButton9')
    // await setTimeout(3000)
    // await page.waitForSelector('#i0118') // Selector del input
    // await setTimeout(3000)
    // await page.type('#i0118', 'Hitagicrab3232', { delay: 300 })

    await setTimeout(5000)

    await page.goto(
      'https://webapp.ucsm.edu.pe/sm/Views/page_consultas_horarios.php'
    )

    // ederClick({ cssSelector: '#popup a:nth-of-type(2)', page })
    // ederClick({ cssSelector: 'sidebar_main_toggle', page })

    await setTimeout(3000)
    await page.waitForSelector('#select_escuela')
    await setTimeout(3000)
    await page.select('#select_escuela', '45-364')
    await setTimeout(3000)

    await page.waitForSelector('#select_semestre')
    const optionsSemester = await page.evaluate(() => {
      // Obtener todas las opciones del <select>
      const select = document.querySelector(
        '#select_semestre'
      ) as HTMLSelectElement // Reemplaza con el selector adecuado
      if (!select) return []

      //Eliminar la primera opción
      select.remove(0)

      // Extraer texto de todas las opciones
      const semesterOptions = Array.from(select.options).map((option) => ({
        value: option.value,
        text: option.text,
      }))

      // semesterOptions.splice(1)
      return semesterOptions
    })
    console.log(optionsSemester)

    for (const semester of optionsSemester) {
      await setTimeout(3000)
      await page.select('#select_semestre', semester.value)
      await setTimeout(3000)
      await page.waitForSelector('#select_cursos')
      const optionsCourse = await page.evaluate(() => {
        // Obtener todas las opciones del <select>
        const select = document.querySelector(
          '#select_cursos'
        ) as HTMLSelectElement // Reemplaza con el selector adecuado
        if (!select) return []

        //Eliminar la primera opción
        select.remove(0)
        //Existe opciones repetivas con el mismo value y texta, por lo que se eliminan
        const options = Array.from(select.options)
        const uniqueOptions = options.filter(
          (option, index, self) =>
            index ===
            self.findIndex(
              (t) => t.value === option.value && t.text === option.text
            )
        ) // Eliminar duplicados
        select.innerHTML = ''
        uniqueOptions.forEach((option) => select.add(option))

        // Para motivos de prueba crear una linea de codigo que deje solo el primer semestre

        // Extraer texto de todas las opciones
        return Array.from(select.options).map((option) => ({
          value: option.value,
          text: option.text,
        }))
      })

      console.log(optionsCourse)

      await setTimeout(3000)

      // ahora vamos a seleccionar curso por curso
      for (const curso of optionsCourse) {
        await setTimeout(3000)
        await page.waitForSelector('#select_cursos')
        await page.select('#select_cursos', curso.value)
        await setTimeout(3000)
        console.log({
          curso: curso.text,
          semestre: semester.text,
        })

        //Verificar que haya dos tablas dentro del div_carga_horario, y que cada una al menos tenga una celda valida en el body
        try {
          await page.waitForSelector('#div_carga_horario table:nth-of-type(1)')
          await page.waitForSelector('#div_carga_horario table:nth-of-type(2)')
          console.log('se encontraron las tablas')

          await setTimeout(5000)
          const generalData = await page.evaluate(() => {
            let data: Array<{ i: number; values: string[] }> = []
            let table = document.querySelector(
              '#div_carga_horario table:nth-of-type(1)'
            ) as HTMLTableElement
            if (table) {
              let tbody = table.querySelector('tbody')
              if (tbody) {
                for (let i = 0; i < tbody.rows.length; i++) {
                  let row = tbody.rows.item(i)
                  if (row) {
                    let objCells = row.cells
                    let values: string[] = []
                    for (let j = 0; j < objCells.length; j++) {
                      let cell = objCells.item(j)
                      if (cell) {
                        let text = cell.innerHTML
                        values.push(text)
                      } else {
                        values.push('') // Manejar celdas nulas
                      }
                    }
                    let d = { i, values }
                    data.push(d)
                  }
                }
              }
            }

            return data
          })

          const escuelaProfesional = generalData[0].values[1]
          const semestre = generalData[1].values[1]
          const curso = generalData[2].values[1]

          console.log({
            escuelaProfesional,
            semestre,
            curso,
          })

          const tableData = await page.evaluate(() => {
            let data: Array<{ i: number; values: string[] }> = []
            let table = document.querySelector(
              '#div_carga_horario table:nth-of-type(2)'
            ) as HTMLTableElement
            if (table) {
              let tbody = table.querySelector('tbody')
              if (tbody) {
                for (let i = 0; i < tbody.rows.length; i++) {
                  let row = tbody.rows.item(i)
                  if (row) {
                    let objCells = row.cells
                    let values: string[] = []
                    for (let j = 0; j < objCells.length; j++) {
                      let cell = objCells.item(j)
                      if (cell) {
                        let text = cell.innerHTML
                        values.push(text)
                      } else {
                        values.push('') // Manejar celdas nulas
                      }
                    }
                    let d = { i, values }
                    data.push(d)
                  }
                }
              }
            }

            return data
          })

          tableData.forEach((element: any) => {
            data.push({
              escuela: escuelaProfesional,
              semestre,
              curso,
              seccion: element.values[0],
              docente: element.values[1],
              diaHora: element.values[2],
              numeroMatriculados: element.values[3],
            })
          })

          // console.log(tableData[0])
        } catch (error) {
          console.log('No se encontraron tablas')
          console.log(error)
          continue
        }
      }
    }

    // Guardar todos los datos de "data" en un archivo .csv
    const ws = fs.createWriteStream('data.csv')
    fastcsv.write(data, { headers: true }).pipe(ws)

    await browser.close()
  })

const ederClick = async ({
  cssSelector,
  page,
}: {
  cssSelector: string
  page: Page
}) => {
  await setTimeout(3000)
  await page.waitForSelector(cssSelector) // Selector del input
  await setTimeout(3000)
  await page.click(cssSelector)
}

console.log('dataFinal')
console.log(data)
