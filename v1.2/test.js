const t = {'s':['q','e','t'],'r':['c','v','b']}

const buscar = (valores,letra) =>{
let index
let key
  for(key in valores){
    index = valores[key].indexOf(letra)
    if(index != -1) break
  }
  return {index:index, key:key}
}


const x = ['q','e'].map(e => buscar(t, e))

const indexCells = (hoursTeacher, hoursAvaliables) =>{
  let indexTeacherHour
  let indexAvaliableHour
  for(const hour in hoursTeacher){
    indexAvaliableHour = hoursAvaliables.indexOf(hoursTeacher[hour])
    if (indexAvaliableHour != -1){
      indexTeacherHour = hour
      break;
    }
  }
  return {indexTeacherHour:indexTeacherHour, indexAvaliableHour:indexAvaliableHour}
}

const c = () => Logger.log(cellHour())



