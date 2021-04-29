export function shuffle<T>(array: Array<T>): Array<T> {
    let i: number = array.length;
    let x: number;
  
    while (0 !== i) {
      x = Math.floor(Math.random() * --i);
      [array[i], array[x]] = [array[x], array[i]];
    }
    
    return array;
}