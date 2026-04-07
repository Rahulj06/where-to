'use client'

import type { TVote } from '@/lib/types'

interface IVoteButtonsProps {
  disabled: boolean
  onVote: (vote: TVote) => void
}

export const VoteButtons = ({ disabled, onVote }: IVoteButtonsProps) => {
  return (
    <div
      className="pointer-events-auto absolute right-4 bottom-28 z-40 flex flex-col gap-4 sm:right-6 sm:bottom-32"
      aria-label="Vote"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onVote('yes')}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/15 text-2xl shadow-lg backdrop-blur-md transition-transform active:scale-95 disabled:opacity-40"
        aria-label="Yes, I want this"
      >
        👍
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onVote('no')}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/15 text-2xl shadow-lg backdrop-blur-md transition-transform active:scale-95 disabled:opacity-40"
        aria-label="No, skip"
      >
        ❌
      </button>
    </div>
  )
}
