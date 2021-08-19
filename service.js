const letter = (index) => ['B','C','D','E','F'][index]

const createValuesKeys = (data) =>{
  const keys = data[0]
  const values = data.slice(1,-1)
  const elements = []
  values.map(teacher=>{
    let infoTeacher = {}
    keys.forEach((key, index)=>{
      infoTeacher[`${key}`] = teacher[index]
    })
    elements.push(infoTeacher)
  })
  return elements
}

const defineRangeHours = (teacher) =>{
  const hours = [1,2,3,4,5]//TODO valor dependiendo las horas que defina la persona
  const indexDay = ['L', 'Ma', 'Mr', 'J', 'V']
  const defineValues = (letterInd) => hours.map(hour => `${letterInd}${hour}`)
  const hoursAvaliable = []
  indexDay.forEach((day, index)=>{
    let letterInd = letter(index)
    teacher[`${day}`] ? hoursAvaliable.push(...defineValues(letterInd)) : ''
  })
  indexDay.forEach(day => delete teacher[`${day}`])
  return hoursAvaliable
}

const createRangeAvaliable = (data, keys) =>{
  data.forEach(teacher=>{
    teacher['hoursAvaliable'] = defineRangeHours(teacher)
  })
  return groupSubjects(data, keys)
}

const groupSubjects = (data, keys) =>{
  const rePrincipal = /^Asignatura [0-9]$/
  const subjects = keys.filter(key => rePrincipal.test(key))
  const subjectsTeacher = {}
  subjects.forEach(value =>{
    subjectsTeacher[`${value}`] = keys.filter(key => key.includes(value))
  })
  return addSubjects(data, subjectsTeacher)
}

const addSubjects = (data, subjectsTeacher) =>{
  const subjectsKeys = Object.keys(subjectsTeacher)
  data.forEach(teacher=>{
    let subjects = {}
    subjectsKeys.forEach(key=>{
      subjects[`${key}`] = {
        name : teacher[subjectsTeacher[`${key}`][0]],
        sessions: teacher[subjectsTeacher[`${key}`][1]],
        section: teacher[subjectsTeacher[`${key}`][2]],
        grade: teacher[subjectsTeacher[`${key}`][3]]
      }
      delete teacher[`${key}`]
      delete teacher[`${key}|Clases a la semana`]
      delete teacher[`${key}|Sección`]
    })
    teacher['subjects'] = subjects
  })
  Logger.log(data[5])
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
<<<<<<< HEAD
=======

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
  insertValueRestric(dataSubjects, dataTeachers){
    const teachersWithRes = dataTeachers['restrictions'].map(teacher => Object.keys(teacher)[0])
    teachersWithRes.forEach((teacher, index)=>{
      let hoursTeacher = dataTeachers['restrictions'][index][`${teacher}`][1]['B']
      if(dataSubjects[`${teacher}`].length == hoursTeacher.length || dataSubjects[`${teacher}`].length < hoursTeacher.length){
        dataSubjects[`${teacher}`].forEach((hour, index)=>{
          let hoursAvaliable = this.getCells(hour[3])
          let indexHour = hoursAvaliable.indexOf(hoursTeacher[index]) 
          if(indexHour != -1){
            let sheet = this.spreadSheet.getSheetByName(`${hour[3]}`)
            sheet.getRange(hoursTeacher[index]).setValue(hour[1])
          }
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





>>>>>>> 7cb3d707d7590ac2e066db9a5d4af9916c553091
