const createSchedules = () =>{
  const informationTeacher = new InformationTeacher().getData()
  const groups = ['4010', '5010', '6010', '6020', '6030', '6040']
  const calendar = new CalendarValues()
  const dataSubjects = new DataSeccion('4').getValues()
  Logger.log(dataSubjects)
  //calendar.insertSheet(groups)
  //
  Object.keys(dataSubjects).forEach(group =>{
    if(['6010', '6020', '6030', '6040'].includes(group)){
      const cells = calendar.getCells(group)
      //console.log(dataSubjects[`${group}`])
      calendar.insertValueRestric(group, dataSubjects, informationTeacher)
    }
  })
}

const inserValues= ()=>{

}