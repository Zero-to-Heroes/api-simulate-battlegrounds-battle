import { Card } from '../card.interface';
import { CrystalInfuserEnchantment } from './enchantments/crystal-infuser-enchantment';
import { ArcaneCannoneer } from './minion/arcane-cannoneer';
import { Banerboar } from './minion/bannerboar';
import { Beetle } from './minion/beetle';
import { BirdBuddy } from './minion/bird-buddy';
import { BoarGamer } from './minion/boar-gamer';
import { BubbleGunner } from './minion/bubble-gunner';
import { BuzzingVermin } from './minion/buzzing-vermin';
import { CadaverCaretaker } from './minion/cadaver-caretaker';
import { DeathlyStriker } from './minion/deathly-striker';
import { EfficientEngineer } from './minion/efficient-engineer';
import { ElectricSynthesizer } from './minion/electric-synthesizer';
import { FairyGillmother } from './minion/fairy-gillmother';
import { ForestRover } from './minion/forest-rover';
import { FountainChiller } from './minion/fountain-chiller';
import { GemRat } from './minion/gem-rat';
import { GentleDjinni } from './minion/gentle-djinni';
import { GrittyHeadhunter } from './minion/gritty-headhunter';
import { Hackerfin } from './minion/hackerfin';
import { HandlessForsaken } from './minion/handless-forsaken';
import { HarmlessBonehead } from './minion/harmless-bonehead';
import { HoloRover } from './minion/holo-rover';
import { HungrySnapjaw } from './minion/hungry-snapjaw';
import { ImplantSubject } from './minion/implant-subject';
import { Manasaber } from './minion/manasaber';
import { MarqueeTicker } from './minion/marquee-ticker';
import { MoonsteelJuggernaut } from './minion/moonsteel-juggernaut';
import { MutatedLasher } from './minion/mutated-lasher';
import { NeonAgent } from './minion/neon-agent';
import { NestSwarmer } from './minion/nest-swarmer';
import { NetherDrake } from './minion/nether-drake';
import { Niuzao } from './minion/niuzao';
import { OutbackSmolderer } from './minion/outback-smolderer';
import { RazorgoreTheUntamed } from './minion/razorgore-the-untamed';
import { RecklessCliffdiver } from './minion/reckless-cliffdiver';
import { RunedProgenitor } from './minion/runed-progenitor';
import { RylakMetalhead } from './minion/rylak-metalhead';
import { SaltyHog } from './minion/salty-hog';
import { ShowyCyclist } from './minion/showy-cyclist';
import { SilverHandedRecruit } from './minion/silver-handed-recruit';
import { SlyRaptor } from './minion/sly-raptor';
import { Spacefarer } from './minion/spacefarer';
import { TurquoiseSkitterer } from './minion/turquoise-skitterer';
import { TwilightPrimordium } from './minion/twilight-primordium';
import { UltravioletAscendant } from './minion/ultraviolet-ascendant';
import { WanderingWight } from './minion/wandering-wight';
import { WispInTheShell } from './minion/wisp-in-the-shell';

export const cardMappings: {
	[cardId: string]: Card;
} = {};

const cards = [
	HoloRover,
	ForestRover,
	Beetle,
	BuzzingVermin,
	GemRat,
	NestSwarmer,
	RunedProgenitor,
	TurquoiseSkitterer,
	EfficientEngineer,
	NetherDrake,
	ElectricSynthesizer,
	OutbackSmolderer,
	RazorgoreTheUntamed,
	UltravioletAscendant,
	TwilightPrimordium,
	GentleDjinni,
	MoonsteelJuggernaut,
	MarqueeTicker,
	RecklessCliffdiver,
	FountainChiller,
	NeonAgent,
	ImplantSubject,
	Hackerfin,
	BubbleGunner,
	FairyGillmother,
	ShowyCyclist,
	ArcaneCannoneer,
	MutatedLasher,
	SilverHandedRecruit,
	SaltyHog,
	Spacefarer,
	GrittyHeadhunter,
	CrystalInfuserEnchantment,
	BoarGamer,
	Banerboar,
	WanderingWight,
	DeathlyStriker,
	WispInTheShell,
	HandlessForsaken,
	HarmlessBonehead,
	CadaverCaretaker,
	HungrySnapjaw,
	Niuzao,
	BirdBuddy,
	SlyRaptor,
	Manasaber,
	RylakMetalhead,
];
for (const card of cards) {
	const cardIds = card.cardIds ?? [];
	for (const cardId of cardIds) {
		cardMappings[cardId] = card;
	}
}
