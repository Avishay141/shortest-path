

function mySleep(sec) {
    let start = new Date().getMilliseconds();
    while (true) {
        let next = new Date().getMilliseconds();
        let diff = Math.abs(next - start);
        if (diff > sec) {
            break;
        }
    }
}


export default mySleep;