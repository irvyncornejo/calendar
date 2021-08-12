const y = () => Logger.log(new CellsHours().getValuesForWeek())
const letter = (index) => ['A','B','C','D','E','F'][index]
const x = () => Logger.log(new SheetValidate('TR_ASIGNATURAS').validateKeys())
const w = () => new DataSeccion().getValues()
const z = () => new CalendarValues().insertSheet()

class SheetValidate{
  constructor(name){
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  }
  validateKeys(){
    const lastRow = this.sheet.getLastRow()
    const lastColumn = this.sheet.getLastColumn()
    //row, column, numRows, numColumns
    const data = this.sheet.getRange(1,1, lastRow, lastColumn).getValues()[0]
    const dataForKeys = this.getKeys(data, lastColumn)
    if(lastColumn === dataForKeys.lastColumn){
      return {keys: dataForKeys.keys, range:[1,1,lastRow, lastColumn], sheet:this.sheet, error: null}
    }else return {keys: dataForKeys.keys, range:[1,1,lastRow, dataForKeys.lastColumn], sheet:this.sheet, error:'Diferentes'}
  }

  getKeys(data, lastColumn){
    const keys = []
    data.forEach(key => key != '' ? keys.push(key) : '')
    if(keys.length === lastColumn) return {keys: keys, lastColumn: lastColumn}
    else return {keys: keys, lastColumn: keys.length}
  }
}

class CellsHours{
  constructor(name){
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
    //Hora de salida podrías ser diferente 'A2:A15'
    this.headers = this.sheet.getRangeList(['B1:F1', 'A2:A15']).getRanges()
    this.days = this.headers[0].getValues()[0]
    this.hours = this.headers[1].getValues()
  }
  getValuesForWeek(){
    const spacesForWeek = this.validateSpaces()
    return spacesForWeek
  }
  getValuesForDay(){
    //TODO
  }
  validateSpaces(){
    const data = this.sheet.getRange('B2:F15').getValues()
    const hoursClass = []
    const cells= (row, hourIndex) => row.forEach((cell, index)=>{
        cell === ''
        ? hoursClass.push(`${letter(index+1)}${hourIndex+2}`)
        : ''
    })
    data.forEach((row, index) =>{
      const hourIndex = index
      index === 4 || index === 9 
      ? ''  
      : cells(row, hourIndex)
    })
    return hoursClass
  }
  createDummy(){
    days.forEach((day, index) =>{
      let column = index + 2
      hours.forEach((hour, index)=>{
        let row = index + 2
        hour[0] === '' || hour[0] === 'Receso'
          ? ''
          : this.sheet.getRange(row, column).setValue(`${day}|${hour}`)
      })
    })
  }
}

//Chercar el estado de cada una de las celdas
//crear array u objeto con los valores de cada celda vacía
class DataSeccion{
  constructor(){
    this.seccion = '4'
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TR_ASIGNATURAS')
  }
  getValues(){
    const rangeData = new SheetValidate('TR_ASIGNATURAS').validateKeys()
    const sheet = rangeData['sheet']
    const range = rangeData['range']
    const dataValues = sheet.getRange(range[0], range[1], range[2], range[3]).getValues()
    const rangeValues = dataValues.filter(row => row[4] == this.seccion)
    return this.groupSubjects(rangeValues)
  }
  groupSubjects(data){
    const groups = {}
    data.forEach(row =>{
      if(Object.keys(groups).includes(`${row[3]}`)){
        groups[`${row[3]}`].push(row)
      }else{
        groups[`${row[3]}`] = [row]
      }
    })
    return groups
  }
}

class CalendarValues{
  constructor(){
    this.spreadSheet = SpreadsheetApp.openById('1ICL5O_7FCoSTpUIwcZ8FlqiSS40aHgleRTj1QDSrtDc')
  }
  insertSheet(){
    const cellsAvailable = new CellsHours('ideas').getValuesForWeek()
    Logger.log(cellsAvailable)
    const data = new DataSeccion().getValues()
    for(let key in data){
      this.spreadSheet.insertSheet().setName(`${key}`)
    }
    for(let key in data){
      const sheet = this.spreadSheet.getSheetByName(`${key}`)
      let ref = 0
      data[`${key}`].forEach((row, index)=>{
        Array.from(Array(row[6]).keys()).forEach(x => {
          sheet.getRange(`${cellsAvailable[ref]}`).setValue(`${row[2]}`)
          ref+=1
        })
      })
    }
  }
}



