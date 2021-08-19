const onOpen = () => {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('📅 Horarios').addItem('🛠 Generar','someFunction').addToUi()
  
}

const loadData = () =>{
  const info = new SheetValidate('Config Profesores').validateKeys()
  const range = info['range']
  const data = info['sheet'].getRange(range[0], range[1], range[2], range[3]).getValues()
  const keys = data[0]
  const teachers = createValuesKeys(data)
  Logger.log(createRangeAvaliable(teachers, keys))
}

const test_1 = () => Logger.log(new InformationTeachers().loadData()[0])

class InformationTeachers{
  constructor(){
    this.info = new SheetValidate('Config Profesores').validateKeys()
  }
  loadData(){
    const range = this.info['range']
    const data = this.info['sheet'].getRange(range[0], range[1], range[2], range[3]).getValues()
    const keys = data[0]
    const teachers = this.createValuesKeys(data)
    return this.createRangeAvaliable(teachers, keys)
  }
  createValuesKeys(data){
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
  createRangeAvaliable(data, keys){
    data.forEach(teacher=>{
      teacher['hoursAvaliable'] = defineRangeHours(teacher)
    })
    return this.groupSubjects(data, keys)
  }

  groupSubjects(data, keys){
    const rePrincipal = /^Asignatura [0-9]$/
    const subjects = keys.filter(key => rePrincipal.test(key))
    const subjectsTeacher = {}
    subjects.forEach(value =>{
      subjectsTeacher[`${value}`] = keys.filter(key => key.includes(value))
    })
    return this.addSubjects(data, subjectsTeacher)
}

  addSubjects(data, subjectsTeacher){
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
    return data
  }
}