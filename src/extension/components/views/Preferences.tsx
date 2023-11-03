import React from 'react'
import { Dropdown } from '../../../components/inputs/Dropdown.jsx'
import { Range } from '../../../components/inputs/Range.jsx'
import { Command, Key } from 'react-feather'
import { Button } from '../../../components/Button.js'
import { useSession } from '../../../hooks/useSession.js'
import { useSync } from '../../../hooks/useSync.js'

const downloadAudioFormats = [
  { value: 'MP3_64_KBPS', title: 'MP3 (64kbps)', description: 'Recommended' },
  { value: 'MP3', title: 'MP3 (32kbps)' },
]

const readingAudioFormats = [
  { value: 'OGG_OPUS', title: 'OGG', description: 'Recommended' },
  { value: 'LINEAR16', title: 'WAV' },
  { value: 'MP3_64_KBPS', title: 'MP3 (64kbps)' },
  { value: 'MP3', title: 'MP3 (32kbps)' },
]

const audioProfiles = [
  {
    value: 'default',
    title: 'Default',
    description: 'Recommended',
  },
  {
    value: 'wearable-class-device',
    title: 'Wearable class device',
    description: 'Smart watches and other wearables',
  },
  {
    value: 'handset-class-device',
    title: 'Handset class device',
    description: 'Smartphones or tablets',
  },
  {
    value: 'headphone-class-device',
    title: 'Headphone class device',
    description: 'Earbuds and over-ears',
  },
  {
    value: 'small-bluetooth-speaker-class-device',
    title: 'Small bluetooth speaker class device',
    description: 'Portable Bluetooth speakers',
  },
  {
    value: 'medium-bluetooth-speaker-class-device',
    title: 'Medium bluetooth speaker class device',
    description: 'Desktop Bluetooth speakers',
  },
  {
    value: 'large-home-entertainment-class-device',
    title: 'Large home entertainment class device',
    description: 'TVs or home theater systems',
  },
  {
    value: 'large-automotive-class-device',
    title: 'Large automotive class device',
    description: 'Car audio systems',
  },
  {
    value: 'telephony-class-application',
    title: 'Telephony class application',
    description: 'Call centers or IVR systems',
  },
]

export function Preferences() {
  const { ready: sessionReady, session } = useSession()
  const { ready: syncReady, sync, setSync } = useSync()

  if (!sessionReady || !syncReady) return null
  const languageOptions = getLanguageOptions(session)
  const voiceOptions = getVoiceOptions(session, sync.language)
  const voice = sync.voices[sync.language] || voiceOptions[0]?.value

  console.log(voiceOptions)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Credentials
        </div>
        <div className="bg-white p-3 rounded shadow-sm border flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Dropdown
              label="Language"
              value={sync.language}
              onChange={(language) => {
                if (languageOptions.find((l: any) => l.value === language)) {
                  setSync({ ...sync, language })
                }
              }}
              placeholder="Select language"
              options={languageOptions}
            />
            <Dropdown
              label="Voice"
              value={voice}
              onChange={(voice) => {
                if (voiceOptions.find((v) => v.value === voice)) {
                  setSync({
                    ...sync,
                    voices: { ...sync.voices, [sync.language]: voice },
                  })
                }
              }}
              placeholder="Select voice"
              options={voiceOptions}
            />
          </div>
          <div>
            <Dropdown
              label="Audio profile"
              value={sync.audioProfile}
              onChange={(audioProfile) => {
                if (audioProfiles.find((p) => p.value === audioProfile)) {
                  setSync({ ...sync, audioProfile })
                }
              }}
              placeholder="Select audio profile"
              options={audioProfiles}
            />
          </div>
          <div className="grid gap-4">
            <Range
              label="Speed"
              min={0.5}
              max={3}
              step={0.05}
              value={sync.speed}
              unit="×"
              onChange={(speed) => setSync({ ...sync, speed })}
              ticks={[0.5, 1, 1.5, 2, 2.5, 3]}
            />
            <Range
              label="Pitch"
              min={-10}
              max={10}
              step={0.1}
              value={sync.pitch}
              onChange={(pitch) => setSync({ ...sync, pitch })}
              ticks={[-10, -5, 0, 5, 10]}
            />
            <Range
              label="Volume Gain"
              min={-16}
              max={16}
              step={1}
              value={sync.volumeGainDb}
              unit="dB"
              onChange={(volumeGainDb) => setSync({ ...sync, volumeGainDb })}
              ticks={[-16, -8, 0, 8, 16]}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Audio format
        </div>
        <div className="grid gap-4 grid-cols-2 bg-white p-3 rounded shadow-sm border">
          <Dropdown
            label="When downloading"
            value={sync.downloadEncoding}
            options={downloadAudioFormats}
            onChange={(downloadEncoding) => {
              if (
                downloadAudioFormats.find((f) => f.value === downloadEncoding)
              ) {
                setSync({ ...sync, downloadEncoding })
              }
            }}
          />
          <Dropdown
            label="When reading aloud"
            value={sync.readAloudEncoding}
            options={readingAudioFormats}
            onChange={(readAloudEncoding) => {
              if (
                readingAudioFormats.find((f) => f.value === readAloudEncoding)
              ) {
                setSync({ ...sync, readAloudEncoding })
              }
            }}
          />
        </div>
      </div>
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Shortcuts
        </div>
        <div className="grid gap-4 grid-cols-2 bg-white p-3 rounded shadow-sm border">
          <Button
            type="primary"
            Icon={Command}
            onClick={() =>
              chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
            }
          >
            Edit shortcuts
          </Button>
        </div>
      </div>
    </div>
  )
}

function getVoiceOptions(session, language) {
  if (!session?.voices) return []

  const voicesInLanguage = session.voices.filter((voice) =>
    voice.languageCodes.includes(language),
  )

  const uniqueVoiceNames = new Set()

  const voiceNames = voicesInLanguage
    .map(({ name: value, ssmlGender }) => {
      const title = value.split('-').slice(2).join(' ')
      const description =
        ssmlGender.charAt(0).toUpperCase() + ssmlGender.toLowerCase().slice(1)
      return { value, title, description }
    })
    .filter(({ value }) => {
      if (uniqueVoiceNames.has(value)) {
        return false
      }

      uniqueVoiceNames.add(value)
      return true
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  return voiceNames
}

function getLanguageOptions(session) {
  if (!session?.languages) return []
  const displayNames = new Intl.DisplayNames(['en-US'], {
    type: 'language',
    languageDisplay: 'standard',
  })

  const languageNames = session.languages.map((value) => {
    const displayName = displayNames.of(value)
    if (!displayName) throw new Error(`No display name for ${value}`)

    let [title, ...tail] = displayName.split(' ')
    title += ` (${value.split('-')[1]})`
    let description = tail.join(' ')
    if (description.startsWith('(')) description = description.slice(1, -1)
    if (description.endsWith(')')) description = description.slice(0, -1)

    return { value, title, description }
  })

  const sortedLanguages = Array.from(languageNames).sort((a: any, b: any) => {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })

  return sortedLanguages
}