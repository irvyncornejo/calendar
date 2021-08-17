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
