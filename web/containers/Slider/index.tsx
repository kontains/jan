import React, { useState } from 'react'

import {
  Slider,
  Input,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@janhq/uikit'
import { useAtomValue, useSetAtom } from 'jotai'

import { InfoIcon } from 'lucide-react'

import { useActiveModel } from '@/hooks/useActiveModel'
import { useClickOutside } from '@/hooks/useClickOutside'

import useUpdateModelParameters from '@/hooks/useUpdateModelParameters'

import { getConfigurationsData } from '@/utils/componentSettings'
import { toSettingParams } from '@/utils/model_param'

import { selectedModelAtom } from '../DropdownListSidebar'

import {
  engineParamsUpdateAtom,
  getActiveThreadIdAtom,
  getActiveThreadModelParamsAtom,
} from '@/helpers/atoms/Thread.atom'

type Props = {
  name: string
  title: string
  description: string
  min: number
  max: number
  step: number
  value: number
}

const SliderRightPanel: React.FC<Props> = ({
  name,
  title,
  min,
  max,
  step,
  description,
  value,
}) => {
  const { updateModelParameter } = useUpdateModelParameters()
  const threadId = useAtomValue(getActiveThreadIdAtom)

  const activeModelParams = useAtomValue(getActiveThreadModelParamsAtom)

  const modelSettingParams = toSettingParams(activeModelParams)

  const engineParams = getConfigurationsData(modelSettingParams)

  const setEngineParamsUpdate = useSetAtom(engineParamsUpdateAtom)

  const selectedModel = useAtomValue(selectedModelAtom)
  const { stopModel } = useActiveModel()

  const [showTooltip, setShowTooltip] = useState({ max: false, min: false })

  useClickOutside(() => setShowTooltip({ max: false, min: false }), null, [])

  const onValueChanged = (e: number[]) => {
    if (!threadId) return
    if (engineParams.some((x) => x.name.includes(name))) {
      setEngineParamsUpdate(true)
      stopModel()
    } else {
      setEngineParamsUpdate(false)
    }
    updateModelParameter(threadId, name, e[0])
  }

  const maxValue = (name: string) => {
    switch (name) {
      case 'max_tokens':
        return selectedModel?.parameters.max_tokens || max

      case 'ctx_len':
        return selectedModel?.settings.ctx_len || max

      default:
        return max
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-x-2">
        <p className="text-sm font-semibold text-zinc-500 dark:text-gray-300">
          {title}
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon size={16} className="flex-shrink-0 dark:text-gray-500" />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="top" className="max-w-[240px]">
              <span>{description}</span>
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="relative w-full">
          <Slider
            value={[value]}
            onValueChange={onValueChanged}
            min={min}
            max={maxValue(name)}
            step={step}
          />
          <div className="relative mt-2 flex items-center justify-between text-gray-400">
            <p className="text-sm">{min}</p>
            <p className="text-sm">{maxValue(name) as number}</p>
          </div>
        </div>
        <Tooltip open={showTooltip.max || showTooltip.min}>
          <TooltipTrigger asChild>
            <Input
              type="number"
              className="-mt-4 h-8 w-20"
              min={min}
              max={maxValue(name)}
              value={String(value)}
              onChange={(e) => {
                if (Number(e.target.value) > Number(maxValue(name))) {
                  onValueChanged([Number(maxValue(name))])
                  setShowTooltip({ max: true, min: false })
                } else if (Number(e.target.value) < Number(min)) {
                  onValueChanged([Number(min)])
                  setShowTooltip({ max: false, min: true })
                } else {
                  onValueChanged([Number(e.target.value)])
                  setShowTooltip({ max: false, min: false })
                }
              }}
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="max-w-[240px]" side="top">
              {showTooltip.max && (
                <span>Automatically set to the maximum allowed tokens</span>
              )}
              {showTooltip.min && (
                <span>Automatically set to the minimum allowed tokens</span>
              )}
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
    </div>
  )
}

export default SliderRightPanel
