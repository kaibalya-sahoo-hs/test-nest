import { useState } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')

  // GET: Fetch all users
  const getAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/users")
      const data = await res.json()
      console.log(data);
      setUsers(data)
    } catch (error) {
      console.error("Error while getting all the users", error)
    }
  }

  // POST: Create a new user
  const handleFormSubmit = async (e) => {
    e.preventDefault() // Prevents page reload
    setMessage('')

    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const newUser = await res.json()
        setMessage(`Success! User ${newUser.name} created.`)
        setFormData({ name: '', email: '' }) // Reset form
        getAllUsers() // Refresh list automatically
      } else {
        setMessage("Failed to create user. Please check your server.")
      }
    } catch (error) {
      setMessage("Error connecting to server.")
      console.error(error)
    }
  }

  return (
    <>
      <div>
        <h2>Create User</h2>
        <form onSubmit={handleFormSubmit}>
          <input 
            type="text" 
            placeholder="Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <button type="submit">Submit</button>
        </form>

        {/* Display Success/Error Message */}
        {message && <p><strong>{message}</strong></p>}

        <hr />

        <h2>User List</h2>
        <button onClick={getAllUsers}>Get All Users</button>
        
        <ul>
          {users.map((user, index) => (
            <li key={user.id || index}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App