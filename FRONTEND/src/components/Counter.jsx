import React, {useState} from 'react'

function Counter1() {
    const [counter,setCounter] = useState(0);
    const handleIncrement = () => {
        setCounter(counter+1)
    }
    const handleDecrement = () => {
        setCounter(counter-1)
    }
    return(
        <>
            <h1>Counter: {counter}</h1>
            <button onClick={handleIncrement}>Increment</button>
            <button onClick={handleDecrement}>Decrement</button>
            
        </>
    )
}
export default Counter1