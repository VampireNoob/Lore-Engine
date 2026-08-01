import { postApoc } from './postApoc'
import { fantasy } from './fantasy'
import { scifi } from './scifi'
import { cyberpunk } from './cyberpunk'

export const settings = [postApoc, fantasy, scifi, cyberpunk]

export const getSettingById = (id) => settings.find(s => s.id === id)