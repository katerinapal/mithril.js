"use strict"

export default typeof setImmediate === "function" ? setImmediate : setTimeout;;
