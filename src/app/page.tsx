'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [input, setInput] = useState<string>()
  const [searchResults, setSearchResults] = useState<{
    results: string[]
    duration: number
  }>()

  useEffect(() => {
    const fetchData = async () => {
      if (!input) return setSearchResults(undefined)
      const response = await fetch(
        `https://fastapi.ckqlss.workers.dev/api/search?q=${input}`,
      )
      const data = await response.json()
      setSearchResults(data)
      console.log(data)
    }
    fetchData()
  }, [input])

  return (
    <main className="h-screen">
      <div className="flex flex-col items-center pt-32 duration-500">
        <input
          type="text"
          defaultValue={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div>
          {searchResults ? (
            <>
              <p>Results:</p>
              <ul>
                {searchResults.results.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
              <p>Duration: {searchResults.duration}ms</p>
            </>
          ) : (
            <p>No results</p>
          )}
        </div>
      </div>
    </main>
  )
}
