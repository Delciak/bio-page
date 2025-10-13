"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Github,
  Instagram,
  Linkedin,
  Music,
  Loader2,
  Twitter,
  Eye,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
} from "lucide-react"

// Music track type
type MusicTrack = {
  id: number
  title: string
  artist: string
  album: string
  duration: number
  src: string
  cover: string
}

// Simple in-memory view counter
let globalViewCount = 0

export default function BioPage() {
  const [viewCount, setViewCount] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Mouse position for parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasIncrementedView = useRef(false)

  // Sample music tracks - replace with your actual MP3 files
  const musicTracks: MusicTrack[] = [
    {
      id: 1,
      title: "Chill Vibes",
      artist: "Lo-Fi Artist",
      album: "Relaxing Beats",
      duration: 180,
      src: "/music/track1.mp3",
      cover: "/placeholder.svg?height=80&width=80&text=Track+1",
    },
    {
      id: 2,
      title: "Midnight Dreams",
      artist: "Ambient Sounds",
      album: "Night Sessions",
      duration: 240,
      src: "/music/track2.mp3",
      cover: "/placeholder.svg?height=80&width=80&text=Track+2",
    },
    {
      id: 3,
      title: "Digital Waves",
      artist: "Electronic Beats",
      album: "Synthwave Collection",
      duration: 200,
      src: "/music/track3.mp3",
      cover: "/placeholder.svg?height=80&width=80&text=Track+3",
    },
  ]

  const currentTrack = musicTracks[currentTrackIndex]

  // Mark component as mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle initial interaction
  const handleInitialClick = useCallback(async () => {
    if (!mounted || hasInteracted) return

    setHasInteracted(true)

    // Start playing music
    if (audioRef.current) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error("Error playing audio:", error)
      }
    }

    // Increment page views
    if (!hasIncrementedView.current) {
      globalViewCount++
      setViewCount(globalViewCount)
      hasIncrementedView.current = true
    }
  }, [mounted, hasInteracted])

  // Initialize event listeners
  useEffect(() => {
    if (!mounted || !hasInteracted) return

    // Mouse move handler for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        setMousePosition({ x, y })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current)
      }
    }
  }, [mounted, hasInteracted])

  // Audio event handlers
  useEffect(() => {
    if (!mounted) return

    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % musicTracks.length)
      setCurrentTime(0)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      console.error("Error loading audio track")
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
    }
  }, [currentTrackIndex, mounted, musicTracks.length])

  // Update audio volume
  useEffect(() => {
    if (!mounted || !audioRef.current) return
    audioRef.current.volume = volume
  }, [volume, mounted])

  // Handle track changes
  useEffect(() => {
    if (!mounted || !audioRef.current || !hasInteracted) return

    const audio = audioRef.current
    setCurrentTime(0)

    if (isPlaying) {
      const playTimeout = setTimeout(() => {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
        })
      }, 100)

      return () => clearTimeout(playTimeout)
    }
  }, [currentTrackIndex, mounted, hasInteracted, isPlaying])

  // Play/pause functionality
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !mounted) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      setIsPlaying(false)
    }
  }, [isPlaying, mounted])

  // Next track
  const nextTrack = useCallback(() => {
    if (!mounted) return
    setCurrentTrackIndex((prev) => (prev + 1) % musicTracks.length)
  }, [mounted, musicTracks.length])

  // Previous track
  const prevTrack = useCallback(() => {
    if (!mounted) return
    setCurrentTrackIndex((prev) => (prev - 1 + musicTracks.length) % musicTracks.length)
  }, [mounted, musicTracks.length])

  // Seek functionality
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !duration || !mounted) return

      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration

      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    },
    [duration, mounted],
  )

  // Volume control
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!mounted) return
      const newVolume = Number.parseFloat(e.target.value)
      setVolume(newVolume)
    },
    [mounted],
  )

  const toggleMute = useCallback(() => {
    if (!mounted) return
    setVolume(volume === 0 ? 0.7 : 0)
  }, [volume, mounted])

  const showVolumeControl = useCallback(() => {
    if (!mounted) return
    setShowVolumeSlider(true)
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current)
    }
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false)
    }, 3000)
  }, [mounted])

  // Format time
  const formatTime = useCallback((time: number): string => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [])

  // Get volume icon
  const getVolumeIcon = useCallback(() => {
    if (volume === 0) return VolumeX
    if (volume < 0.5) return Volume1
    return Volume2
  }, [volume])

  // Calculate parallax transform based on mouse position
  const parallaxTransform = useCallback(() => {
    if (!cardRef.current || !mounted) return {}

    const { x, y } = mousePosition
    const rect = cardRef.current.getBoundingClientRect()
    const maxX = rect.width / 2
    const maxY = rect.height / 2

    const moveX = (x / maxX) * 5
    const moveY = (y / maxY) * 5

    return {
      transform: `perspective(1000px) rotateX(${-moveY * 0.5}deg) rotateY(${moveX * 0.5}deg) translateX(${moveX}px) translateY(${moveY}px)`,
      transition: "transform 0.1s ease-out",
    }
  }, [mousePosition, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10 px-4 relative overflow-hidden bg-black">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    )
  }

  const VolumeIcon = getVolumeIcon()

  // Show initial click screen
  if (!hasInteracted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Video Background */}
        <div className="fixed inset-0 w-full h-full -z-10 bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="/placeholder.svg?height=1080&width=1920&text=Loading+Video"
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Animated particles overlay */}
        <div className="fixed inset-0 -z-5 pointer-events-none">
          <div className="particles-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Audio Element (preload) */}
        <audio ref={audioRef} src={currentTrack.src} preload="auto" />

        {/* Click Me Button */}
        <button
          onClick={handleInitialClick}
          className="relative z-10 group cursor-pointer"
          aria-label="Click to enter and play music"
        >
          <div className="text-center">
            {/* Music Icon with Pulse Animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center border-4 border-purple-400/30 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Click Me Text */}
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white text-glow group-hover:scale-105 transition-transform duration-300">
                Click Me
              </h1>
              <p className="text-xl text-gray-300 group-hover:text-white transition-colors duration-300">
                Enter & Play Music
              </p>
            </div>

            {/* Animated Arrow */}
            <div className="mt-8 flex justify-center">
              <div className="animate-bounce">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            </div>
          </div>
        </button>
      </div>
    )
  }

  // Show main profile after interaction
  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full -z-10 bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/placeholder.svg?height=1080&width=1920&text=Loading+Video"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated particles overlay */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        <div className="particles-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        ref={cardRef}
        style={parallaxTransform()}
        className="max-w-md w-full backdrop-blur-xl bg-black/40 rounded-2xl shadow-xl border border-purple-500/20 p-8 relative z-10 animate-fade-in"
      >
        {/* View Counter */}
        <div className="absolute top-3 left-3 mt-1 flex items-center text-xs text-gray-300 bg-black/60 px-2 py-1 rounded-full shadow-glow-sm">
          <Eye className="w-3 h-3 mr-1 text-purple-400" />
          <span>{viewCount} views</span>
        </div>

        {/* Profile Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden border-2 border-purple-500 shadow-glow">
            <Image
              src="/placeholder.svg?height=112&width=112&text=Profile"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold mb-1 text-white text-glow">@username</h1>
          <p className="text-gray-200 text-center max-w-xs">
            Web developer, designer, and music enthusiast. Building cool things on the web.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4 mb-8 justify-center">
          <Link
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-colors shadow-glow-sm"
          >
            <Twitter className="w-5 h-5 text-white" />
          </Link>
          <Link
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-colors shadow-glow-sm"
          >
            <Instagram className="w-5 h-5 text-white" />
          </Link>
          <Link
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-colors shadow-glow-sm"
          >
            <Github className="w-5 h-5 text-white" />
          </Link>
          <Link
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-colors shadow-glow-sm"
          >
            <Linkedin className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Music Player Section */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-3 flex items-center text-white text-glow-sm">
            <Music className="w-4 h-4 mr-2" />
            Music Player
          </h2>
          <div className="bg-black/60 rounded-lg p-4 border border-purple-500/20 shadow-glow-sm">
            {/* Audio Element */}
            <audio ref={audioRef} src={currentTrack.src} preload="metadata" />

            {/* Track Info */}
            <div className="flex items-center mb-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 mr-3">
                <Image
                  src={currentTrack.cover || "/placeholder.svg"}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm truncate">{currentTrack.title}</h3>
                <p className="text-xs text-gray-300 truncate">{currentTrack.artist}</p>
                <p className="text-xs text-gray-400 truncate">{currentTrack.album}</p>
              </div>
              {/* Volume Control */}
              <div className="relative ml-2">
                <button
                  onClick={() => {
                    toggleMute()
                    showVolumeControl()
                  }}
                  onMouseEnter={showVolumeControl}
                  className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-purple-900/50 transition-colors"
                  aria-label="Volume control"
                >
                  <VolumeIcon className="w-4 h-4 text-white" />
                </button>
                {showVolumeSlider && (
                  <div
                    className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 backdrop-blur-sm"
                    onMouseEnter={() => {
                      if (volumeTimeoutRef.current) {
                        clearTimeout(volumeTimeoutRef.current)
                      }
                    }}
                    onMouseLeave={() => {
                      volumeTimeoutRef.current = setTimeout(() => {
                        setShowVolumeSlider(false)
                      }, 1000)
                    }}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume * 100}%, #4b5563 ${
                          volume * 100
                        }%, #4b5563 100%)`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-glow-xs transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prevTrack}
                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-purple-900/50 transition-colors"
                aria-label="Previous track"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-purple-900/50 transition-colors"
                aria-label="Next track"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Track List Indicators */}
            {musicTracks.length > 1 && (
              <div className="flex items-center justify-center gap-1 mt-4">
                {musicTracks.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTrackIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentTrackIndex ? "bg-purple-500" : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    aria-label={`Play track ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>© 2025 • Made with Next.js</p>
        </div>
      </div>
    </div>
  )
}
