import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const server = express()

// Express middleware
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

const prisma = new PrismaClient()

// Get all the Users
server.get('/', (req, res) => {
  return res.json({ message: 'Hello World' })
})

const saltRound: number = 12

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltRound)
}

// Create a User
server.post('/user', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const hashedPassword = await hashPassword(password)
    const users = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
    return res.json({ data: users })
  } catch (error) {
    console.error('Error creating user', error)
    return res.status(500).json({ message: 'Error occured' })
  }
})

// Get all the User

server.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({})
    return res.status(200).json({ data: users })
  } catch (error) {
    console.error('Error occured', error)
    return res.status(500).json({ message: 'Cannot fetch all users' })
  }
})

// Get user by ID

server.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id)
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) return res.status(200).json({ message: 'User not registered' })
    return res.status(200).json({ message: 'Single user fetched', data: user })
  } catch (error) {
    console.log('Error has occured', error)
    return res.status(500).json({ message: 'Cannot get single user' })
  }
})

// Update user by ID

server.put('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id)
    const { name } = req.body
    const userUpdated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
      },
      select: {
        name: true,
        email: true,
      },
    })
    if (!userUpdated)
      return res.status(400).json({ message: 'User not found ' })
    return res.status(200).json({ message: 'User updated', data: userUpdated })
  } catch (error) {
    console.log('Error occured', error)
    return res.status(200).json({ message: 'Cannot update user' })
  }
})

// Delete user by ID

server.delete('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id)
    const deleteUser = await prisma.user.delete({
      where: { id: userId },
    })
    if (!deleteUser) return res.status(400).json({ message: 'User not found ' })
    return res.status(200).json({ message: 'User deleted' })
  } catch (error) {
    console.log('Error occured', error)
    return res.status(200).json({ message: 'Cannot delete user' })
  }
})

server.listen(4000, () => console.log('The server is listening on port 4000'))
