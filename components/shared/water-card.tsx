'use client'

import { useState } from 'react'
import { useWaterStore } from '@/store/use-water-store'
import { useProfileStore } from '@/store/use-profile-store'
import { getTodayString } from '@/lib/utils/date'
import { formatWater } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { Droplets, Pencil, Check, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_WATER_TARGET = 2500
const QUICK_AMOUNTS = [250, 500, 750]

export function WaterCard() {
  const today = getTodayString()
  const { profile, setWaterTarget } = useProfileStore()
  const { getDayIntake, getDayEntries, addWaterEntry, deleteWaterEntry } = useWaterStore()

  const target = profile?.waterTarget ?? DEFAULT_WATER_TARGET
  const consumed = getDayIntake(today)
  const entries = getDayEntries(today)
  const progress = Math.min(consumed / target, 1)
  const isComplete = consumed >= target

  const [customAmount, setCustomAmount] = useState('')
  const [editingTarget, setEditingTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')
  const [saved, setSaved] = useState(false)

  function handleQuickAdd(ml: number) {
    addWaterEntry(ml)
  }

  function handleCustomAdd() {
    const ml = parseInt(customAmount)
    if (isNaN(ml) || ml <= 0 || ml > 5000) return
    addWaterEntry(ml)
    setCustomAmount('')
  }

  function handleEditOpen() {
    setTargetInput(String(target))
    setEditingTarget(true)
  }

  function handleSaveTarget() {
    const val = parseInt(targetInput)
    if (isNaN(val) || val < 500 || val > 10000) return
    setWaterTarget(val)
    setEditingTarget(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card-premium p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
          <Droplets className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">Hydration</div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatWater(consumed)} / {formatWater(target)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-cyan-500 font-medium"
              >
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={editingTarget ? handleSaveTarget : handleEditOpen}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
          >
            {editingTarget ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Target edit input */}
      <AnimatePresence>
        {editingTarget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mb-4">
              <Input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTarget()}
                placeholder="Daily target (ml)"
                min={500}
                max={10000}
                className="flex-1 h-9 text-sm"
                autoFocus
              />
              <button
                onClick={() => setEditingTarget(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
          <span className="tabular-nums">{Math.round(progress * 100)}%</span>
          <span className={cn(isComplete && 'text-cyan-500 font-semibold')}>
            {isComplete ? 'Goal reached!' : `${formatWater(Math.max(target - consumed, 0))} remaining`}
          </span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Quick-add buttons */}
      <div className="flex gap-2 mb-3">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            onClick={() => handleQuickAdd(ml)}
            className="flex-1 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:border-cyan-500/50 hover:text-cyan-500 hover:bg-cyan-500/5 transition-all"
          >
            +{ml}ml
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Custom amount (ml)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
          min={1}
          max={5000}
          className="flex-1 h-9 text-sm"
        />
        <Button
          size="sm"
          onClick={handleCustomAdd}
          disabled={!customAmount}
          className="h-9 px-3 bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Today's logged entries */}
      <AnimatePresence>
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t border-border/40"
          >
            <div className="space-y-0.5">
              <AnimatePresence>
                {[...entries].reverse().map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-xs text-muted-foreground tabular-nums">
                      +{formatWater(entry.amountMl)}
                    </span>
                    <button
                      onClick={() => deleteWaterEntry(entry.id)}
                      className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
