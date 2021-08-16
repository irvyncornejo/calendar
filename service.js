const letter = (index) => ['A','B','C','D','E','F'][index]
const createObjectValues = (data, number) => {
  const object = {}
  data.forEach(row =>{
      if(Object.keys(object).includes(`${row[number]}`)){
        object[`${row[number]}`].push(row)
      }else{
        object[`${row[number]}`] = [row]
      }
    })
  return object
}

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
    this.spreadSheet = SpreadsheetApp.openById('1ICL5O_7FCoSTpUIwcZ8FlqiSS40aHgleRTj1QDSrtDc')
    this.sheet = this.spreadSheet.getSheetByName(name)
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
    //TODO define values for day and define index of the day 
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
  constructor(seccion){
    this.seccion = seccion
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TR_ASIGNATURAS')
  }
  getValues(){
    const rangeData = new SheetValidate('TR_ASIGNATURAS').validateKeys()
    const sheet = rangeData['sheet']
    const range = rangeData['range']
    const dataValues = sheet.getRange(range[0], range[1], range[2], range[3]).getValues()
    const rangeValues = dataValues.filter(row => row[4] == this.seccion)
    return this.groupTeacher(rangeValues)
  }
  groupSubjects(data){
    const groups = createObjectValues(data, 3)
    return groups
  }
  groupTeacher(data){
    const teachers = createObjectValues(data, 1)
    return teachers
  }
}

class CalendarValues{
  constructor(){
    this.spreadSheet = SpreadsheetApp.openById('1ICL5O_7FCoSTpUIwcZ8FlqiSS40aHgleRTj1QDSrtDc')
  }
  getCells(name){
    const cellsAvailable = new CellsHours(name).getValuesForWeek()
    const data = new DataSeccion().getValues()
    return cellsAvailable
    //this.insertValuesForGroup(data, cellsAvailable)
  }
  insertSheet(data){
    data.forEach(group => this.spreadSheet.insertSheet().setName(`${group}`))
  }
  insertValuesForGroup(data, cellsAvailable){
    for(let key in data){
      const sheet = this.spreadSheet.getSheetByName(`${key}`)
      let ref = 0
      data[`${key}`].forEach(row=>{
        Array.from(Array(row[6]).keys()).forEach(times=>{
          sheet.getRange(`${cellsAvailable[ref]}`).setValue(`${row[2]}`)
          ref+=1
        })
      })
    }
  }
  insertValueRestric(group, dataSubjects, dataTeachers){
    const sheet = this.spreadSheet.getSheetByName(`${group}`)
    const teachersWithRes = dataTeachers['restrictions'].map(teacher => Object.keys(teacher)[0])
    dataSubjects.forEach(teacher =>{
      let firtsIndex = teachersWithRes.indexOf(teacher[1])
      if(firtsIndex != -1 ){
        let teacherRes = dataTeachers['restrictions'][firtsIndex][teacher[1]][1]['B']
        teacher.forEach(hour=>{

        })
      }
    })
  }
}

class InformationTeacher{
  constructor(){
    this.information = new SheetValidate('TR_PROFESORES').validateKeys()
  }
  getData(){
    const sheet = this.information['sheet']
    const range = this.information['range']
    const data = sheet.getRange(range[0], range[1], range[2], range[3]).getValues()
    return this.cleanObject(data.slice(1,-1))
  }
  cleanObject(data){
    const dataTeachers = createObjectValues(data, 0)
    const dataTeachersGrouped = {restrictions:[], normal:[]}
    Object.keys(dataTeachers).forEach(key=>{
      if(dataTeachers[`${key}`][0][6] != false){
        dataTeachersGrouped['restrictions'].push(
          ({[key]:[dataTeachers[`${key}`][0][1], JSON.parse(dataTeachers[`${key}`][0][6])]}))
      }
      else{
        dataTeachersGrouped['normal'].push(({[key]:[dataTeachers[`${key}`][0][1], dataTeachers[`${key}`][0][6]]}))
      }
    })
    return dataTeachersGrouped
  }
  order(data){
    //TODO Definir la cantidad de restricciones o definir prioridades
    data['restrictions'].sort((a, b)=>{
      let teacherA = a[Object.keys(a)[0]][1]
      let teacherB = b[Object.keys(b)[0]][1]
      if(teacherA < teacherB) return -1
      if(teacherA > teacherB) return 1
      return 0
    })
  }
}





