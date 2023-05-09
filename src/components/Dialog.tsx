import * as React from "react"
import { CalenderIcon, CloseIcon, CompleteIcon, DoneAll, IncompleteIcon, RemoveDone, RemoveIcon } from "../icons"
import { firebaseConfig } from "../data/db"
import { initializeApp } from "firebase/app"
import { collection, doc, getDocs, getFirestore, setDoc, updateDoc, deleteDoc } from "firebase/firestore"


type Todo = { id: string; title: string; complete: boolean }
type ListInput = {
    todo: Todo
    pending: boolean
    updateTodo: (update: Todo) => void
    removeTodo: () => void
}
const firestoreApp = initializeApp(firebaseConfig)
const db = getFirestore(firestoreApp)

export default function Dialog() {
    const [todos, setTodos] = React.useState<Array<Todo>>([])
    const [statuses, setStatuses] = React.useState<{
        loadingTodos: 'idle' | 'loading'
        creatingTodo: 'idle' | 'loading'
        togglingAllTodos: 'idle' | 'loading'
        clearingCompleteTodos: 'idle' | 'loading'
    }>({
        loadingTodos: 'loading',
        creatingTodo: 'idle',
        togglingAllTodos: 'idle',
        clearingCompleteTodos: 'idle',
    })

    React.useEffect(() => {
        console.log("rendered")
        const getSnapshot = async () => {
            await getDocs(collection(db, "sunub")).then((docs) => {
                const newTodo: Todo[] = []
                docs.forEach(doc => {
                    const data = doc.data()
                    const todoData = {
                        title: data.title,
                        id: data.id,
                        complete: data.complete
                    }
                    newTodo.push(todoData)
                })
                setTodos(newTodo)
            })
        }
        getSnapshot()
    }, [])


    const hasCompleteTodos = todos.some(todo => todo.complete === true)
    const remainActive = todos.filter(t => !t.complete)
    const allComplete = remainActive.length === 0

    return <section className="todoapp" data-status={statuses.loadingTodos} >
        <dialog className="MegaDialog" modal-mode="mega">
            <form
                method="dialog"
                className="dialog-todo-form"
                onSubmit={async event => {
                    event.preventDefault()
                    const form = event.currentTarget
                    const titleInput = form.elements.namedItem("title") as HTMLInputElement
                    const title = titleInput.value.trim()
                    if (title.length === 0) return

                    setStatuses((old) => ({ ...old, creatingTodo: "loading" }))

                    const date = new Intl.DateTimeFormat("kor-KR", { year: "numeric", month: "numeric", day: "numeric", second: "numeric" }).format(Date.now()).replace(/\s/g, "")
                    const newTodo = {
                        title: title,
                        id: date,
                        complete: false
                    }

                    setDoc(doc(db, "sunub", `${date}`), newTodo).then(() => {
                        setTodos(old => [...old, newTodo])
                        form.reset()
                        setStatuses(old => ({ ...old, creatingTodo: "idle" }))
                    })
                }}
            >
                <header className="header">
                    <section title="New Todo Title">
                        <div>
                            <CalenderIcon />
                            <h1>Insert your Todos</h1>
                        </div>
                        <button id="close-button" onClick={(event) => {
                            document.querySelector(".MegaDialog")?.removeAttribute("open")
                            document.querySelector(".MegaDialog")?.setAttribute("inert", "")
                        }}>
                            <CloseIcon />
                        </button>
                    </section>
                    <input
                        className="new-todo"
                        placeholder="What need to be done?"
                        title="New todo title"
                        name="title"
                        autoFocus
                        data-pending={statuses.creatingTodo === "loading"}
                    />
                </header>
                <article className={`main ${todos.length ? '' : 'no-todos'}`}>
                    <button
                        className={`toggle-all ${allComplete ? 'checked' : ''}`}
                        title={
                            allComplete ? `Mark all as incomplete` : `Mark all as Complete`
                        }
                        onClick={() => {
                            setStatuses(old => ({ ...old, togglingAllTodos: "loading" }))
                            todos.map(async (todo) => {
                                todo.complete = !allComplete
                                await updateDoc(doc(db, "sunub", `${todo.id}`), todo).then(() => {
                                    setStatuses(old => ({ ...old, togglingAllTodos: "idle" }))
                                    setTodos((todo) => {
                                        todo.forEach(data => {
                                            data.complete = !allComplete
                                        })
                                        return todo
                                    })
                                })
                            })
                        }}
                    >
                        {allComplete ? <DoneAll /> : <RemoveDone />}
                    </button>
                    <ul className="todo-list" hidden={!todos.length}>
                        {todos.map((todo) => {
                            return <ListItem
                                todo={todo}
                                key={todo.id}
                                pending={
                                    (statuses.togglingAllTodos === 'loading' && todo.complete === allComplete) || (statuses.clearingCompleteTodos === 'loading' && todo.complete)
                                }
                                updateTodo={updates => {
                                    setTodos((curTodos) =>
                                        curTodos.map(t =>
                                            t.id === todo.id ? { ...t, ...updates } : t
                                        )
                                    )
                                }}
                                removeTodo={() => {
                                    setTodos(currentTodo => currentTodo.filter((t) => t.id !== todo.id))
                                }}
                            />
                        })}
                    </ul>
                </article>
                <footer>
                    <span className="todo-count">
                        <strong>{remainActive.length}</strong>
                        <span>
                            {' '}
                            {remainActive.length === 1 ? 'item' : 'items'} left
                        </span>
                    </span>
                    <ul>
                        <menu>
                            <button>All</button>
                        </menu>
                        <menu>
                            <button
                                title="Show Activate todos"
                            >Activate</button>
                        </menu>
                        <menu>
                            <button>Completed</button>
                        </menu>
                    </ul>
                    <button>Clear All</button>
                </footer>
            </form>
        </dialog>
    </section>
}


function ListItem({ todo, pending: externalPending, updateTodo, removeTodo }: ListInput) {
    const [statuses, setStatuses] = React.useState<{
        updating: 'idle' | 'loading'
        toggling: 'idle' | 'loading'
        deleting: 'idle' | 'loading'
    }>({
        updating: 'idle',
        toggling: 'idle',
        deleting: 'idle',
    })
    const complete = todo.complete
    const pending = externalPending ||
        statuses.updating === 'loading' ||
        statuses.toggling === 'loading' ||
        statuses.deleting === 'loading'

    return <>
        <li className={complete ? 'completed' : ''}>
            <div className="view">
                <button
                    className="toggle"
                    title={complete ? `Mark as incomplete` : `Mark as complete`}
                    onClick={async () => {
                        todo.complete = !complete
                        setStatuses(old => ({ ...old, toggling: 'loading' }))
                        await updateDoc(doc(db, "sunub", `${todo.id}`), todo).then(() => {
                            setStatuses(old => ({ ...old, updating: "idle" }))
                            updateTodo(todo)
                        })
                    }}
                >
                    {complete ? <CompleteIcon /> : <IncompleteIcon />}
                </button>
                <input
                    defaultValue={todo.title}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur()
                        }
                    }}
                    onBlur={async (event) => {
                        const input = event.currentTarget
                        const newTitle = input.value
                        if (newTitle !== todo.title) {
                            setStatuses(old => ({ ...old, updating: "loading" }))
                            todo.title = newTitle
                            await updateDoc(doc(db, "sunub", `${todo.id}`), todo).then(() => {
                                updateTodo(todo)
                                setStatuses(old => ({ ...old, updating: 'idle' }))
                            })
                        }
                    }}
                />
                <button
                    className="destory"
                    title="Delete todo"
                    onClick={async () => {
                        await deleteDoc(doc(db, "sunub", `${todo.id}`)).then(() => {
                            removeTodo()
                        })
                    }}
                >
                    <RemoveIcon />
                </button>
            </div>
        </li>
    </>
}