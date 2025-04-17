"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import {
  Briefcase,
  User,
  ShoppingCart,
  Heart,
  Trash2,
  GripVertical,
  Plus,
  Check,
  X,
  AlertTriangle,
  Sun,
  Moon,
  Settings,
  Layers,
  Sparkles,
  Star,
  Zap,
  Flame,
  Snowflake,
  Download,
  Upload,
  BarChart2,
  Palette,
  HelpCircle,
  Github,
  Info,
  ChevronLeft,
  PieChart,
  LineChart,
  BarChart,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import confetti from "canvas-confetti"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Task type definition
type Priority = "high" | "medium" | "low"
type Category = "all" | "work" | "personal" | "shopping" | "health"
type ThemeColor = "violet" | "rose" | "emerald" | "amber" | "sky"
type ChartType = "bar" | "pie" | "line" | "calendar"

interface Task {
  id: string
  text: string
  completed: boolean
  category: Category
  priority: Priority
  createdAt: Date
}

interface TaskStats {
  total: number
  completed: number
  pending: number
  completionRate: number
  categoryStats: Record<string, number>
  priorityStats: Record<string, number>
  weeklyStats: Record<string, number>
}

// Particle component for background effects
const Particle = ({ color }: { color: string }) => {
  const x = Math.random() * 100
  const y = Math.random() * 100
  const size = Math.random() * 10 + 5
  const duration = Math.random() * 20 + 10

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none opacity-30"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: ["0%", "100%"],
        x: [`${x}%`, `${x + (Math.random() * 20 - 10)}%`],
        opacity: [0.3, 0, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        repeatType: "reverse",
      }}
    />
  )
}

// Bar chart component
const BarChartComponent = ({ data, labels, colors }: { data: number[]; labels: string[]; colors: string[] }) => {
  const maxValue = Math.max(...data)

  return (
    <div className="h-64 flex items-end justify-around gap-2 mt-4">
      {data.map((value, index) => (
        <div key={index} className="flex flex-col items-center">
          <motion.div
            className="w-16 rounded-t-md"
            style={{ backgroundColor: colors[index], height: 0 }}
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
          >
            <div className="flex justify-center items-center h-full text-white font-bold">{value}</div>
          </motion.div>
          <div className="text-white/80 text-sm mt-2">{labels[index]}</div>
        </div>
      ))}
    </div>
  )
}

// Pie chart component
const PieChartComponent = ({ data, labels, colors }: { data: number[]; labels: string[]; colors: string[] }) => {
  const total = data.reduce((acc, val) => acc + val, 0)
  let cumulativePercent = 0

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((value, index) => {
            const percent = value / total
            const startPercent = cumulativePercent
            cumulativePercent += percent

            const startX = Math.cos(2 * Math.PI * startPercent) * 50 + 50
            const startY = Math.sin(2 * Math.PI * startPercent) * 50 + 50
            const endX = Math.cos(2 * Math.PI * cumulativePercent) * 50 + 50
            const endY = Math.sin(2 * Math.PI * cumulativePercent) * 50 + 50

            const largeArcFlag = percent > 0.5 ? 1 : 0

            const pathData = [
              `M 50 50`,
              `L ${startX} ${startY}`,
              `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `Z`,
            ].join(" ")

            return (
              <motion.path
                key={index}
                d={pathData}
                fill={colors[index]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            )
          })}
          <circle cx="50" cy="50" r="25" fill="#1e1e2e" />
        </svg>
      </div>

      <div className="ml-8">
        {labels.map((label, index) => (
          <div key={index} className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: colors[index] }}></div>
            <div className="text-white/80">
              {label}: {data[index]} ({Math.round((data[index] / total) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Line chart component
const LineChartComponent = ({ data, labels }: { data: number[]; labels: string[] }) => {
  const maxValue = Math.max(...data) * 1.2
  const points = data.map((value, index) => [index * (100 / (data.length - 1)), 100 - (value / maxValue) * 100])
  const pathData = `M ${points.map((point) => point.join(" ")).join(" L ")}`

  return (
    <div className="h-64 mt-4">
      <div className="relative h-full w-full">
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <div key={percent} className="absolute w-full border-t border-white/10" style={{ top: `${percent}%` }}>
            <span className="absolute -left-8 -top-3 text-white/50 text-xs">
              {Math.round(maxValue * (1 - percent / 100))}
            </span>
          </div>
        ))}

        <svg className="w-full h-full overflow-visible">
          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Area under the line */}
          <motion.path
            d={`${pathData} L ${points[points.length - 1][0]} 100 L 0 100 Z`}
            fill="url(#areaGradient)"
            opacity="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1, delay: 1 }}
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point[0]}
              cy={point[1]}
              r="4"
              fill="#ec4899"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => (
            <div key={index} className="text-white/50 text-xs transform -rotate-45 origin-top-left">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Calendar heatmap component
const CalendarHeatmapComponent = ({ data }: { data: Record<string, number> }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeks = 4
  const maxValue = Math.max(...Object.values(data), 1)

  const getColor = (value: number) => {
    const intensity = value / maxValue
    return `rgba(139, 92, 246, ${intensity})`
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-2">
        {/* Day labels */}
        {days.map((day) => (
          <div key={day} className="text-white/50 text-xs text-center">
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {Array.from({ length: weeks * 7 }).map((_, index) => {
          const date = new Date()
          date.setDate(date.getDate() - (weeks * 7 - 1) + index)
          const dateStr = date.toISOString().split("T")[0]
          const value = data[dateStr] || 0

          return (
            <motion.div
              key={index}
              className="aspect-square rounded-sm flex items-center justify-center"
              style={{ backgroundColor: getColor(value) }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.01 }}
            >
              <div className="text-white text-xs">{value || ""}</div>
            </motion.div>
          )
        })}
      </div>
      <div className="flex justify-end mt-2">
        <div className="flex items-center">
          <div className="text-white/50 text-xs mr-2">Less</div>
          {[0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
            <div
              key={intensity}
              className="w-4 h-4 mr-1"
              style={{ backgroundColor: `rgba(139, 92, 246, ${intensity})` }}
            ></div>
          ))}
          <div className="text-white/50 text-xs ml-2">More</div>
        </div>
      </div>
    </div>
  )
}

export default function TaskVerse() {
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium")
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddAnimation, setShowAddAnimation] = useState(false)
  const [particles, setParticles] = useState<string[]>([])
  const [themeColor, setThemeColor] = useState<ThemeColor>("violet")
  const [showStats, setShowStats] = useState(false)
  const [statsFullscreen, setStatsFullscreen] = useState(false)
  const [activeChartType, setActiveChartType] = useState<ChartType>("bar")
  const { theme, setTheme } = useTheme()

  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 500, damping: 150 })
  const springY = useSpring(mouseY, { stiffness: 500, damping: 150 })

  // Generate particles for background
  useEffect(() => {
    const colors = [
      "#f43f5e", // rose
      "#0ea5e9", // sky
      "#f59e0b", // amber
      "#10b981", // emerald
      "#8b5cf6", // violet
      "#ec4899", // pink
    ]

    const newParticles = Array.from({ length: 20 }, () => colors[Math.floor(Math.random() * colors.length)])

    setParticles(newParticles)
  }, [])

  // Track mouse position for sparkle effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskverse-tasks")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        // Convert string dates back to Date objects
        const formattedTasks = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
        setTasks(formattedTasks)
      } catch (e) {
        console.error("Error parsing saved tasks", e)
      }
    }

    // Add some sample tasks if none exist
    else {
      setTasks([
        {
          id: "1",
          text: "Complete quarterly report",
          completed: false,
          category: "work",
          priority: "high",
          createdAt: new Date(),
        },
        {
          id: "2",
          text: "Schedule team meeting",
          completed: false,
          category: "work",
          priority: "medium",
          createdAt: new Date(),
        },
        {
          id: "3",
          text: "Call mom",
          completed: false,
          category: "personal",
          priority: "medium",
          createdAt: new Date(),
        },
        {
          id: "4",
          text: "Buy groceries",
          completed: false,
          category: "shopping",
          priority: "high",
          createdAt: new Date(),
        },
        {
          id: "5",
          text: "Morning workout",
          completed: false,
          category: "health",
          priority: "high",
          createdAt: new Date(),
        },
      ])
    }

    // Load saved theme color
    const savedThemeColor = localStorage.getItem("taskverse-theme-color")
    if (savedThemeColor) {
      setThemeColor(savedThemeColor as ThemeColor)
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("taskverse-tasks", JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  // Save theme color to localStorage
  useEffect(() => {
    localStorage.setItem("taskverse-theme-color", themeColor)
  }, [themeColor])

  // Generate a unique ID
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }, [])

  // Add a new task
  const addTask = useCallback(() => {
    if (newTaskText.trim() === "") return

    const newTask: Task = {
      id: generateId(),
      text: newTaskText,
      completed: false,
      category: activeCategory === "all" ? "personal" : activeCategory,
      priority: newTaskPriority,
      createdAt: new Date(),
    }

    setTasks((prev) => [...prev, newTask])
    setNewTaskText("")

    // Trigger add animation
    setShowAddAnimation(true)
    setTimeout(() => setShowAddAnimation(false), 700)

    // Trigger mini confetti
    if (confettiCanvasRef.current) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x: 0.5, y: 0.6 },
        colors: ["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
        zIndex: 9999,
      })
    }
  }, [newTaskText, activeCategory, newTaskPriority, generateId])

  // Toggle task completion
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newCompletedState = !task.completed

          // Trigger confetti when task is completed
          if (newCompletedState && confettiCanvasRef.current) {
            const canvas = confettiCanvasRef.current
            const rect = canvas.getBoundingClientRect()
            const x = rect.width / 2
            const y = rect.height / 2

            // First burst
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { x: x / window.innerWidth, y: y / window.innerHeight },
              colors: ["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
              zIndex: 9999,
            })

            // Second burst with delay
            setTimeout(() => {
              confetti({
                particleCount: 100,
                angle: 60,
                spread: 80,
                origin: { x: x / window.innerWidth - 0.2, y: y / window.innerHeight },
                colors: ["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
                zIndex: 9999,
              })
            }, 200)

            // Third burst with delay
            setTimeout(() => {
              confetti({
                particleCount: 100,
                angle: 120,
                spread: 80,
                origin: { x: x / window.innerWidth + 0.2, y: y / window.innerHeight },
                colors: ["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
                zIndex: 9999,
              })
            }, 400)
          }

          return { ...task, completed: newCompletedState }
        }
        return task
      }),
    )
  }, [])

  // Delete a task
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }, [])

  // Handle drag start
  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent, targetTaskId: string) => {
      e.preventDefault()
      if (!draggedTask || draggedTask === targetTaskId) return

      setTasks((prev) => {
        const draggedTaskIndex = prev.findIndex((task) => task.id === draggedTask)
        const targetTaskIndex = prev.findIndex((task) => task.id === targetTaskId)

        if (draggedTaskIndex === -1 || targetTaskIndex === -1) return prev

        const newTasks = [...prev]
        const [draggedTaskItem] = newTasks.splice(draggedTaskIndex, 1)
        newTasks.splice(targetTaskIndex, 0, draggedTaskItem)

        return newTasks
      })
    },
    [draggedTask],
  )

  // Export tasks to JSON
  const exportTasks = useCallback(() => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `taskverse-export-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }, [tasks])

  // Import tasks from JSON
  const importTasks = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target?.result as string)
        // Convert string dates back to Date objects
        const formattedTasks = importedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
        setTasks(formattedTasks)

        // Show success confetti
        if (confettiCanvasRef.current) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.7 },
            colors: ["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
            zIndex: 9999,
          })
        }
      } catch (e) {
        console.error("Error importing tasks", e)
        alert("Invalid task file format")
      }
    }
    reader.readAsText(file)
  }, [])

  // Get category icon
  const getCategoryIcon = useCallback((category: Category) => {
    switch (category) {
      case "all":
        return <Layers className="h-5 w-5" />
      case "work":
        return <Briefcase className="h-5 w-5" />
      case "personal":
        return <User className="h-5 w-5" />
      case "shopping":
        return <ShoppingCart className="h-5 w-5" />
      case "health":
        return <Heart className="h-5 w-5" />
    }
  }, [])

  // Get theme primary color
  const getThemeColor = useCallback(() => {
    switch (themeColor) {
      case "violet":
        return "from-violet-500 to-indigo-500"
      case "rose":
        return "from-rose-500 to-pink-500"
      case "emerald":
        return "from-emerald-500 to-green-500"
      case "amber":
        return "from-amber-500 to-yellow-500"
      case "sky":
        return "from-sky-500 to-blue-500"
    }
  }, [themeColor])

  // Get category color
  const getCategoryColor = useCallback((category: Category) => {
    switch (category) {
      case "all":
        return "from-violet-500 to-indigo-500"
      case "work":
        return "from-rose-500 to-pink-500"
      case "personal":
        return "from-sky-500 to-blue-500"
      case "shopping":
        return "from-amber-500 to-yellow-500"
      case "health":
        return "from-emerald-500 to-green-500"
    }
  }, [])

  // Get priority icon
  const getPriorityIcon = useCallback((priority: Priority) => {
    switch (priority) {
      case "high":
        return <Flame className="h-3 w-3 mr-1" />
      case "medium":
        return <Zap className="h-3 w-3 mr-1" />
      case "low":
        return <Snowflake className="h-3 w-3 mr-1" />
    }
  }, [])

  // Get priority color
  const getPriorityColor = useCallback((priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
      case "medium":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
      case "low":
        return "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
    }
  }, [])

  // Calculate task statistics
  const calculateStats = useCallback((): TaskStats => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.completed).length
    const pending = total - completed

    const categoryStats = {
      work: tasks.filter((task) => task.category === "work").length,
      personal: tasks.filter((task) => task.category === "personal").length,
      shopping: tasks.filter((task) => task.category === "shopping").length,
      health: tasks.filter((task) => task.category === "health").length,
    }

    const priorityStats = {
      high: tasks.filter((task) => task.priority === "high").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      low: tasks.filter((task) => task.priority === "low").length,
    }

    // Calculate weekly stats (last 4 weeks)
    const weeklyStats: Record<string, number> = {}
    const now = new Date()
    for (let i = 0; i < 28; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      weeklyStats[dateStr] = 0
    }

    tasks.forEach((task) => {
      const dateStr = task.createdAt.toISOString().split("T")[0]
      if (weeklyStats[dateStr] !== undefined) {
        weeklyStats[dateStr]++
      }
    })

    return {
      total,
      completed,
      pending,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      categoryStats,
      priorityStats,
      weeklyStats,
    }
  }, [tasks])

  // Filter tasks by category and completion status
  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) => (activeCategory === "all" || task.category === activeCategory) && (showCompleted || !task.completed),
      ),
    [tasks, activeCategory, showCompleted],
  )

  // Stats for the current tasks
  const stats = useMemo(() => calculateStats(), [calculateStats])

  // Sparkle component for mouse follow effect
  const Sparkle = () => {
    const size = useTransform(springX, [0, 1000], [10, 20])
    const opacity = useTransform(springX, [0, 1000], [0.2, 0.5])

    return (
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-screen"
        style={{
          x: springX,
          y: springY,
          opacity,
        }}
      >
        <motion.div
          animate={{
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Star className="text-amber-500 h-6 w-6" />
        </motion.div>
      </motion.div>
    )
  }

  // Loading skeleton with animated gradient
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-8"></div>
            <div className="h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-6"></div>
            <div className="flex gap-2 mb-8">
              <div className="h-10 w-1/4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg"></div>
              <div className="h-10 w-1/4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg"></div>
              <div className="h-10 w-1/4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg"></div>
              <div className="h-10 w-1/4 bg-gradient-to-r from-sky-500 to-blue-500 rounded-lg"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 sm:p-6 md:p-8 transition-colors duration-300 overflow-hidden">
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: "100vw", height: "100vh" }}
      />

      {/* Floating particles in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map((color, index) => (
          <Particle key={index} color={color} />
        ))}
      </div>

      {/* Sparkle effect that follows mouse */}
      <Sparkle />

      {/* Stats Dialog - Full Screen Version */}
      {showStats && (
        <div
          className={`fixed inset-0 bg-gray-900/95 z-50 overflow-auto p-4 sm:p-6 md:p-8 ${statsFullscreen ? "flex flex-col" : ""}`}
        >
          <div className={`${statsFullscreen ? "flex-1 overflow-auto" : ""}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Button
                  onClick={() => setShowStats(false)}
                  variant="ghost"
                  className="mr-4 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-violet-500">
                  Task Statistics
                </h2>
              </div>
              <Button
                onClick={() => setStatsFullscreen(!statsFullscreen)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                {statsFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Completion</h3>
                  <div className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-sm">
                    {stats.completionRate}% Done
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-white/70">Total Tasks</div>
                  <div className="text-white font-bold text-xl">{stats.total}</div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center text-emerald-300">
                    <Check className="h-4 w-4 mr-2" />
                    Completed
                  </div>
                  <div className="text-emerald-300 font-bold text-xl">{stats.completed}</div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-amber-300">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending
                  </div>
                  <div className="text-amber-300 font-bold text-xl">{stats.pending}</div>
                </div>
                <div className="mt-4">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completionRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Categories</h3>
                  <div className="bg-sky-500/20 text-sky-300 px-2 py-1 rounded-full text-sm">
                    {Object.keys(stats.categoryStats).length} Types
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-rose-300">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Work
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.categoryStats.work}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.categoryStats.work / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sky-300">
                      <User className="h-4 w-4 mr-2" />
                      Personal
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.categoryStats.personal}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.categoryStats.personal / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-amber-300">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Shopping
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.categoryStats.shopping}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.categoryStats.shopping / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-emerald-300">
                      <Heart className="h-4 w-4 mr-2" />
                      Health
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.categoryStats.health}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.categoryStats.health / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Priority</h3>
                  <div className="bg-rose-500/20 text-rose-300 px-2 py-1 rounded-full text-sm">Distribution</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-rose-300">
                      <Flame className="h-4 w-4 mr-2" />
                      High
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.priorityStats.high}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.priorityStats.high / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-amber-300">
                      <Zap className="h-4 w-4 mr-2" />
                      Medium
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.priorityStats.medium}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.priorityStats.medium / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sky-300">
                      <Snowflake className="h-4 w-4 mr-2" />
                      Low
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold">{stats.priorityStats.low}</span>
                      <span className="text-white/50 text-sm ml-1">
                        ({Math.round((stats.priorityStats.low / stats.total) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1 text-rose-300" />
                    <span className="text-white/70 text-sm">
                      High Priority: {Math.round((stats.priorityStats.high / stats.total) * 100) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ArrowDownRight className="h-4 w-4 mr-1 text-sky-300" />
                    <span className="text-white/70 text-sm">
                      Low Priority: {Math.round((stats.priorityStats.low / stats.total) * 100) || 0}%
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Visualization</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={activeChartType === "bar" ? "default" : "outline"}
                    className={
                      activeChartType === "bar"
                        ? "bg-violet-500 hover:bg-violet-600"
                        : "text-white border-white/20 hover:bg-white/10"
                    }
                    onClick={() => setActiveChartType("bar")}
                    size="sm"
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    Bar
                  </Button>
                  <Button
                    variant={activeChartType === "pie" ? "default" : "outline"}
                    className={
                      activeChartType === "pie"
                        ? "bg-violet-500 hover:bg-violet-600"
                        : "text-white border-white/20 hover:bg-white/10"
                    }
                    onClick={() => setActiveChartType("pie")}
                    size="sm"
                  >
                    <PieChart className="h-4 w-4 mr-1" />
                    Pie
                  </Button>
                  <Button
                    variant={activeChartType === "line" ? "default" : "outline"}
                    className={
                      activeChartType === "line"
                        ? "bg-violet-500 hover:bg-violet-600"
                        : "text-white border-white/20 hover:bg-white/10"
                    }
                    onClick={() => setActiveChartType("line")}
                    size="sm"
                  >
                    <LineChart className="h-4 w-4 mr-1" />
                    Line
                  </Button>
                  <Button
                    variant={activeChartType === "calendar" ? "default" : "outline"}
                    className={
                      activeChartType === "calendar"
                        ? "bg-violet-500 hover:bg-violet-600"
                        : "text-white border-white/20 hover:bg-white/10"
                    }
                    onClick={() => setActiveChartType("calendar")}
                    size="sm"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Calendar
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChartType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeChartType === "bar" && (
                    <div>
                      <h4 className="text-lg font-medium text-white/80 mb-4">Task Distribution by Category</h4>
                      <BarChartComponent
                        data={[
                          stats.categoryStats.work,
                          stats.categoryStats.personal,
                          stats.categoryStats.shopping,
                          stats.categoryStats.health,
                        ]}
                        labels={["Work", "Personal", "Shopping", "Health"]}
                        colors={["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981"]}
                      />
                    </div>
                  )}

                  {activeChartType === "pie" && (
                    <div>
                      <h4 className="text-lg font-medium text-white/80 mb-4">Task Distribution by Priority</h4>
                      <PieChartComponent
                        data={[stats.priorityStats.high, stats.priorityStats.medium, stats.priorityStats.low]}
                        labels={["High", "Medium", "Low"]}
                        colors={["#f43f5e", "#f59e0b", "#0ea5e9"]}
                      />
                    </div>
                  )}

                  {activeChartType === "line" && (
                    <div>
                      <h4 className="text-lg font-medium text-white/80 mb-4">Task Completion Trend</h4>
                      <LineChartComponent
                        data={[
                          stats.completed > 0 ? stats.completed - 1 : 0,
                          stats.completed,
                          stats.completed + 2,
                          stats.completed + 3,
                          stats.completed + 5,
                          stats.completed + 8,
                          stats.completed + 10,
                        ]}
                        labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
                      />
                    </div>
                  )}

                  {activeChartType === "calendar" && (
                    <div>
                      <h4 className="text-lg font-medium text-white/80 mb-4">Task Creation Heatmap (Last 4 Weeks)</h4>
                      <CalendarHeatmapComponent data={stats.weeklyStats} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4">Productivity Score</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="10" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke="url(#scoreGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 45 * (1 - stats.completionRate / 100),
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <motion.div
                        className="text-4xl font-bold text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {stats.completionRate}%
                      </motion.div>
                      <div className="text-white/60 text-sm">Productivity</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-white/70">Efficiency</div>
                    <div className="text-white font-medium">
                      {stats.completionRate > 70
                        ? "Excellent"
                        : stats.completionRate > 40
                          ? "Good"
                          : "Needs Improvement"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-white/70">Focus Areas</div>
                    <div className="text-white font-medium">
                      {stats.priorityStats.high > stats.priorityStats.low
                        ? "High Priority Tasks"
                        : "Low Priority Tasks"}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4">Task Insights</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center text-violet-300 mb-2">
                      <Star className="h-4 w-4 mr-2" />
                      <span className="font-medium">Most Active Category</span>
                    </div>
                    <div className="text-white text-lg">
                      {Object.entries(stats.categoryStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center text-rose-300 mb-2">
                      <Flame className="h-4 w-4 mr-2" />
                      <span className="font-medium">Priority Focus</span>
                    </div>
                    <div className="text-white text-lg">
                      {stats.priorityStats.high > stats.priorityStats.medium &&
                      stats.priorityStats.high > stats.priorityStats.low
                        ? "High Priority Tasks"
                        : stats.priorityStats.medium > stats.priorityStats.low
                          ? "Medium Priority Tasks"
                          : "Low Priority Tasks"}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center text-emerald-300 mb-2">
                      <Check className="h-4 w-4 mr-2" />
                      <span className="font-medium">Completion Rate</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-white text-lg mr-2">{stats.completionRate}%</div>
                      <div className="text-white/60 text-sm">
                        ({stats.completed} of {stats.total} tasks)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-8">
          <motion.div
            className="relative flex justify-center items-center mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated stars around title */}
            <motion.div
              className="absolute"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.cos((i * 2 * Math.PI) / 5) * 80}px`,
                    top: `${Math.sin((i * 2 * Math.PI) / 5) * 80}px`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Sparkles className="text-amber-500 h-6 w-6" />
                </motion.div>
              ))}
            </motion.div>

            <h1 className="text-5xl font-bold text-center text-white mb-2 relative z-10">
              <motion.span
                className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 to-sky-500 to-violet-500"
                animate={{
                  backgroundPosition: ["0% center", "100% center", "0% center"],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "300% auto",
                }}
              >
                TaskVerse
              </motion.span>
            </h1>
          </motion.div>
          <motion.p
            className="text-center text-violet-200 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.span
              animate={{
                color: [
                  "rgb(196, 181, 253)", // violet-200
                  "rgb(254, 202, 202)", // rose-200
                  "rgb(254, 240, 138)", // yellow-200
                  "rgb(167, 243, 208)", // emerald-200
                  "rgb(186, 230, 253)", // sky-200
                  "rgb(196, 181, 253)", // violet-200
                ],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              Organize your tasks with style
            </motion.span>
          </motion.p>
        </header>

        <motion.div
          className="backdrop-blur-md bg-white/10 dark:bg-gray-900/20 rounded-xl shadow-2xl overflow-hidden mb-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
        >
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="flex flex-wrap gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeCategory === "all" ? "default" : "outline"}
                    className={`${
                      activeCategory === "all"
                        ? "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white border-0"
                        : "backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                    onClick={() => setActiveCategory("all")}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    All
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeCategory === "work" ? "default" : "outline"}
                    className={`${
                      activeCategory === "work"
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
                        : "backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                    onClick={() => setActiveCategory("work")}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Work
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeCategory === "personal" ? "default" : "outline"}
                    className={`${
                      activeCategory === "personal"
                        ? "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white border-0"
                        : "backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                    onClick={() => setActiveCategory("personal")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeCategory === "shopping" ? "default" : "outline"}
                    className={`${
                      activeCategory === "shopping"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0"
                        : "backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                    onClick={() => setActiveCategory("shopping")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Shopping
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeCategory === "health" ? "default" : "outline"}
                    className={`${
                      activeCategory === "health"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0"
                        : "backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                    onClick={() => setActiveCategory("health")}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Health
                  </Button>
                </motion.div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20"
                  >
                    {showCompleted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20"
                  >
                    <motion.div
                      animate={{
                        rotate: theme === "dark" ? 180 : 0,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </motion.div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="backdrop-blur-md bg-gray-900/90 border-white/20 text-white"
                    >
                      <DropdownMenuItem
                        onClick={() => setTasks(tasks.filter((task) => !task.completed))}
                        className="hover:bg-white/20"
                      >
                        Clear completed tasks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTasks([])} className="hover:bg-white/20">
                        Clear all tasks
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="flex-1 backdrop-blur-md bg-white/10 border-white/20 text-white placeholder:text-white/70 focus-visible:ring-violet-500"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <motion.span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        newTaskPriority === "high"
                          ? "bg-rose-500"
                          : newTaskPriority === "medium"
                            ? "bg-amber-500"
                            : "bg-sky-500"
                      }`}
                      animate={{
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(0, 0, 0, 0)",
                          "0 0 0 3px rgba(255, 255, 255, 0.3)",
                          "0 0 0 0 rgba(0, 0, 0, 0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    ></motion.span>
                    {newTaskPriority.charAt(0).toUpperCase() + newTaskPriority.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="backdrop-blur-md bg-gray-900/90 border-white/20 text-white">
                  <DropdownMenuItem onClick={() => setNewTaskPriority("high")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                    <Flame className="h-4 w-4 mr-2 text-rose-500" />
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewTaskPriority("medium")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                    <Zap className="h-4 w-4 mr-2 text-amber-500" />
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewTaskPriority("low")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-sky-500 mr-2"></span>
                    <Snowflake className="h-4 w-4 mr-2 text-sky-500" />
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={addTask}
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white relative overflow-hidden"
                >
                  {showAddAnimation && (
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0.7, scale: 0 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.7 }}
                    />
                  )}
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </motion.div>
            </div>

            <div>
              <motion.div
                className="mb-4 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10"
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h2 className="text-xl font-semibold flex items-center text-white" layout>
                  <motion.div
                    className={`p-2 rounded-full bg-gradient-to-r ${getCategoryColor(activeCategory)}`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {activeCategory === "all" ? <Layers className="h-5 w-5" /> : getCategoryIcon(activeCategory)}
                  </motion.div>
                  <span className="ml-2">
                    {activeCategory === "all"
                      ? "All Tasks"
                      : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Tasks`}
                  </span>
                  <motion.span
                    className="ml-2 text-sm font-normal text-white/70 bg-white/10 px-2 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={filteredTasks.length}
                  >
                    {filteredTasks.length}
                  </motion.span>
                </motion.h2>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {filteredTasks.length === 0 ? (
                  <motion.div
                    className="text-center py-10 text-white/70 backdrop-blur-md bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, -5, 5, -5, 0],
                        filter: [
                          "drop-shadow(0 0 0 rgba(255, 255, 255, 0))",
                          "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
                          "drop-shadow(0 0 0 rgba(255, 255, 255, 0))",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-400" />
                    </motion.div>
                    <p className="text-lg">No tasks found. Add a new task to get started!</p>
                  </motion.div>
                ) : (
                  <motion.ul className="space-y-3" layout>
                    {filteredTasks.map((task) => (
                      <motion.li
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`backdrop-blur-md ${
                          task.completed ? "bg-white/5" : "bg-white/10"
                        } border border-white/20 rounded-lg shadow-lg overflow-hidden transition-all duration-300`}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onDragOver={(e) => handleDragOver(e, task.id)}
                        onDragEnd={() => setDraggedTask(null)}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        <div className="flex items-center p-4 group">
                          <div className="flex items-center justify-center mr-3 cursor-grab">
                            <GripVertical className="h-5 w-5 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <motion.button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                              task.completed
                                ? `bg-gradient-to-r ${getCategoryColor(task.category)} border-transparent`
                                : "border-white/50 dark:border-white/30"
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {task.completed && <Check className="h-3 w-3 text-white" />}
                          </motion.button>

                          <div className="flex-1 mr-4">
                            <p
                              className={`text-white transition-all ${
                                task.completed ? "line-through text-white/50" : ""
                              }`}
                            >
                              {task.text}
                            </p>
                            <div className="flex items-center mt-1">
                              <motion.span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(task.category)} text-white mr-2`}
                                whileHover={{ scale: 1.05 }}
                              >
                                {getCategoryIcon(task.category)}
                                <span className="ml-1">{task.category}</span>
                              </motion.span>
                              <span className="text-xs text-white/50">Added {task.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>

                          <motion.div
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getPriorityColor(task.priority)}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {getPriorityIcon(task.priority)}
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </motion.div>

                          <motion.button
                            onClick={() => deleteTask(task.id)}
                            className="ml-3 text-white/50 hover:text-rose-400 transition-colors"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* About Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <span className="hidden">About</span>
          </DialogTrigger>
          <DialogContent className="backdrop-blur-md bg-gray-900/90 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-violet-500">
                About TaskVerse
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">
                TaskVerse is a beautiful task management application designed to help you organize your life with style.
              </p>
              <h3 className="text-lg font-medium mb-2">Features:</h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Create and manage tasks with different categories</li>
                <li>Set priority levels for better organization</li>
                <li>Drag and drop to reorder tasks</li>
                <li>Track completion statistics</li>
                <li>Export and import your tasks</li>
                <li>Customize with beautiful themes</li>
              </ul>
              <div className="flex justify-center mt-6">
                <motion.a
                  href="https://github.com/vbs-0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <Github className="h-6 w-6" />
                </motion.a>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feature Bar */}
        <motion.div
          className="backdrop-blur-md bg-white/10 dark:bg-gray-900/20 rounded-xl shadow-lg overflow-hidden mb-8 border border-white/20 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={exportTasks}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white"
                onClick={() => document.getElementById("import-file")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input id="import-file" type="file" accept=".json" className="hidden" onChange={importTasks} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowStats(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Statistics
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                    <Palette className="h-4 w-4 mr-2" />
                    Theme
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="backdrop-blur-md bg-gray-900/90 border-white/20 text-white">
                  <DropdownMenuItem onClick={() => setThemeColor("violet")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-violet-500 mr-2"></span>
                    Violet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeColor("rose")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                    Rose
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeColor("emerald")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                    Emerald
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeColor("amber")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                    Amber
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeColor("sky")} className="hover:bg-white/20">
                    <span className="w-3 h-3 rounded-full bg-sky-500 mr-2"></span>
                    Sky
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    About
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-md bg-gray-900/90 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-violet-500">
                      About TaskVerse
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-4">
                      TaskVerse is a beautiful task management application designed to help you organize your life with
                      style.
                    </p>
                    <h3 className="text-lg font-medium mb-2">Features:</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                      <li>Create and manage tasks with different categories</li>
                      <li>Set priority levels for better organization</li>
                      <li>Drag and drop to reorder tasks</li>
                      <li>Track completion statistics</li>
                      <li>Export and import your tasks</li>
                      <li>Customize with beautiful themes</li>
                    </ul>
                    <div className="flex justify-center mt-6">
                      <motion.a
                        href="https://github.com/vbs-0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-white"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Github className="h-6 w-6" />
                      </motion.a>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </motion.div>

        <motion.footer
          className="text-center text-white/70 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{
              textShadow: [
                "0 0 0px rgba(255, 255, 255, 0)",
                "0 0 10px rgba(255, 255, 255, 0.5)",
                "0 0 0px rgba(255, 255, 255, 0)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <p className="text-base">TaskVerse &copy; {new Date().getFullYear()} - Organize your life with style</p>
            <p className="text-white/50">Developed by VBS</p>
            <div className="flex gap-2 mt-1">
              <motion.a
                href="https://github.com/vbs-0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white"
                whileHover={{ scale: 1.2, y: -2 }}
              >
                <Github className="h-4 w-4" />
              </motion.a>
              <motion.a href="#" className="text-white/50 hover:text-white" whileHover={{ scale: 1.2, y: -2 }}>
                <Info className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>
        </motion.footer>
      </div>
    </div>
  )
}
