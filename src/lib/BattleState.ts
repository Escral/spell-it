import State from "~/lib/State"
import EventBus from "~/lib/EventBus"
import type Location from "~/lib/Location"
import type Player from '~/lib/Models/Player'
import TimeController from '~/lib/TimeController'
import BattleLog from '~/lib/BattleLog'
import Formatter from '~/lib/Formatter'

export enum Mode {
    Normal = "Normal",
    Casting = "Casting",
    Paused = "Paused",
}

type BattleStateType = {
    mode: Mode
}

export default class BattleState extends State {
    public eventBus = new EventBus<{
        changeMode: (mode: Mode, oldMode: Mode) => void
    }>()

    declare private state: BattleStateType

    declare public location: Location
    declare public player: Player

    public log = new BattleLog()
    public time = new TimeController()

    constructor(config: {
        location: Location,
        player: Player,
    }) {
        super()

        this.location = config.location
        this.player = config.player

        this.state = reactive({
            mode: Mode.Normal,
        })
    }

    get mode() {
        return this.state.mode
    }

    public changeMode(mode: Mode) {
        const oldMode = this.state.mode

        this.state.mode = mode

        this.eventBus.emit("changeMode", mode, oldMode)
    }

    public start() {
        this.time.start()
        this.location.creatures.forEach(actor => {
            this.time.interval(3 * 1000, () => {
                const target = this.player

                const damage = actor.dealDamage(actor.stats.strength, target)

                this.log.record(`:actor hit :target for :damage damage.`, {
                    actor,
                    target,
                    damage: Formatter.damage(damage),
                })
            })
        })
    }

    public stop() {
        this.time.stop()
    }
}
