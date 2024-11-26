import { CardIds } from '@firestone-hs/reference-data';
import { TempCardIds } from '../../temp-card-ids';
import {
	BattlecryCard,
	DeathrattleSpawnCard,
	EndOfTurnCard,
	OnAttackCard,
	OnSpawnedCard,
	StartOfCombatCard,
} from '../card.interface';
import { Beetle } from './minion/beetle';
import { BuzzingVermin } from './minion/buzzing-vermin';
import { DancingBarnstormer } from './minion/dancing-barnstormer';
import { EfficientEngineer } from './minion/efficient-engineer';
import { ElectricSynthesizer } from './minion/electric-synthesizer';
import { ForestRover } from './minion/forest-rover';
import { FountainChiller } from './minion/fountain-chiller';
import { GentleDjinni } from './minion/gentle-djinni';
import { HoloRover } from './minion/holo-rover';
import { MarqueeTicker } from './minion/marquee-ticker';
import { MoonsteelJuggernaut } from './minion/moonsteel-juggernaut';
import { NeonAgent } from './minion/neon-agent';
import { NestSwarmer } from './minion/nest-swarmer';
import { NetherDrake } from './minion/nether-drake';
import { OutbackSmolderer } from './minion/outback-smolderer';
import { RazorgoreTheUntamed } from './minion/razorgore-the-untamed';
import { RecklessCliffdiver } from './minion/reckless-cliffdiver';
import { RunedProgenitor } from './minion/runed-progenitor';
import { TurquoiseSkitterer } from './minion/turquoise-skitterer';
import { TwilightPrimordium } from './minion/twilight-primordium';
import { UltravioletAscendant } from './minion/ultraviolet-ascendant';

export const cardMappings: {
	[cardId: string]:
		| OnAttackCard
		| StartOfCombatCard
		| OnSpawnedCard
		| DeathrattleSpawnCard
		| BattlecryCard
		| EndOfTurnCard;
} = {
	[TempCardIds.HoloRover]: HoloRover,
	[TempCardIds.HoloRover_G]: HoloRover,
	[TempCardIds.ForestRover]: ForestRover,
	[TempCardIds.ForestRover_G]: ForestRover,
	[TempCardIds.BeetleToken]: Beetle,
	[TempCardIds.BeetleToken_G]: Beetle,
	[TempCardIds.BuzzingVermin]: BuzzingVermin,
	[TempCardIds.BuzzingVermin_G]: BuzzingVermin,
	[TempCardIds.NestSwarmer]: NestSwarmer,
	[TempCardIds.NestSwarmer_G]: NestSwarmer,
	[TempCardIds.RunedProgenitor]: RunedProgenitor,
	[TempCardIds.RunedProgenitor_G]: RunedProgenitor,
	[TempCardIds.TurquoiseSkitterer]: TurquoiseSkitterer,
	[TempCardIds.TurquoiseSkitterer_G]: TurquoiseSkitterer,
	[TempCardIds.EfficientEngineer]: EfficientEngineer,
	[TempCardIds.EfficientEngineer_G]: EfficientEngineer,
	[CardIds.NetherDrake_BG24_003]: NetherDrake,
	[CardIds.NetherDrake_BG24_003_G]: NetherDrake,
	[CardIds.ElectricSynthesizer_BG26_963]: ElectricSynthesizer,
	[CardIds.ElectricSynthesizer_BG26_963_G]: ElectricSynthesizer,
	[CardIds.OutbackSmolderer_BG28_592]: OutbackSmolderer,
	[CardIds.OutbackSmolderer_BG28_592_G]: OutbackSmolderer,
	[CardIds.RazorgoreTheUntamed_BGS_036]: RazorgoreTheUntamed,
	[CardIds.RazorgoreTheUntamed_TB_BaconUps_106]: RazorgoreTheUntamed,
	[TempCardIds.UltravioletAscendant]: UltravioletAscendant,
	[TempCardIds.UltravioletAscendant_G]: UltravioletAscendant,
	[TempCardIds.TwilightPrimordium]: TwilightPrimordium,
	[TempCardIds.TwilightPrimordium_G]: TwilightPrimordium,
	[CardIds.DancingBarnstormer_BG26_162]: DancingBarnstormer,
	[CardIds.DancingBarnstormer_BG26_162_G]: DancingBarnstormer,
	[CardIds.GentleDjinni_BGS_121]: GentleDjinni,
	[CardIds.GentleDjinni_TB_BaconUps_165]: GentleDjinni,
	[TempCardIds.MoonsteelJuggernaut]: MoonsteelJuggernaut,
	[TempCardIds.MoonsteelJuggernaut_G]: MoonsteelJuggernaut,
	[TempCardIds.MarqueeTicker]: MarqueeTicker,
	[TempCardIds.MarqueeTicker_G]: MarqueeTicker,
	[TempCardIds.RecklessCliffdiver]: RecklessCliffdiver,
	[TempCardIds.RecklessCliffdiver_G]: RecklessCliffdiver,
	[TempCardIds.FountainChiller]: FountainChiller,
	[TempCardIds.FountainChiller_G]: FountainChiller,
	[TempCardIds.NeonAgent]: NeonAgent,
	[TempCardIds.NeonAgent_G]: NeonAgent,
};
