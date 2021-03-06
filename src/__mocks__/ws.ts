import { EventEmitter } from 'events'

const orgSetTimeout = setTimeout

const instances: Array<WebSocket> = []
let mockConstructor: Function

class WebSocket extends EventEmitter {
	public CONNECTING = 1
	public OPEN = 2
	public CLOSING = 3
	public CLOSED = 4

	public binaryType: string = ''
	private _pathName: string

	private _mockHost: string = 'ws://127.0.0.1'
	private _mockConnect: boolean = true
	private _emittedConnected: boolean = false
	private _hasEmittedConnected: boolean = false
	private _failConnectEmitTimeout: number = 3000
	private _replyFunction?: Function

	private _readyState: number = this.CLOSED

	constructor (pathName) {
		super()
		this._pathName = pathName

		instances.push(this)

		if (mockConstructor) {
			mockConstructor(this)
		}

		this._readyState = this.CONNECTING

		orgSetTimeout(() => {
			if (!this._updateConnectionStatus()) {
				setTimeout(() => {
					this.emit('error', new Error('Unable to Connect'))
				}, this._failConnectEmitTimeout)
			}
		}, 1)

		// this.emit('open')
		// this.emit('message', message)
		// this.emit('error', error)
		// this.emit('close')
	}
	public static getMockInstances () {
		return instances
	}
	public static clearMockInstances () {
		return instances.splice(0, 9999)
	}
	public static mockConstructor (fcn: (WebSocket) => void) {
		mockConstructor = fcn
	}
	public send (message, callback: (err?: Error) => void) {
		if (!this._emittedConnected) {
			callback(new Error('Error, not connected'))
		} else {
			if (this._replyFunction) {
				callback()

				Promise.resolve(this._replyFunction(message))
				.then((reply) => {
					if (reply) {
						if (typeof reply !== 'string') reply = JSON.stringify(reply)
						this.emit('message', reply)
					}
				})
				.catch((err) => {
					console.log('err')
					this.emit('error', err)
				})
			} else {
				throw new Error('mock ws._replyFunction not set')
			}
		}
	}
	public get readyState () {
		return this._readyState
	}
	public mockReplyFunction (fcn: (msg: string) => Promise<string> | string) {
		this._replyFunction = fcn
	}
	public mockSetConnected (connected) {
		this._mockConnect = connected

		this._updateConnectionStatus()
	}
	public mockSendMessage (message: string | object) {
		if (typeof message !== 'string') message = JSON.stringify(message)
		this.emit('message', message)
	}
	public close () {
		this._readyState = this.CLOSING

		orgSetTimeout(() => {
			this.mockSetConnected(false)
		}, 1)
	}
	private _updateConnectionStatus () {

		let connected: boolean = !!(
			this._pathName.match(this._mockHost) &&
			this._mockConnect
		)

		if (connected !== this._emittedConnected || !this._hasEmittedConnected) {
			this._emittedConnected = connected
			this._hasEmittedConnected = true

			if (connected) {
				this._readyState = this.OPEN
				this.emit('open')
			} else {
				this._readyState = this.CLOSED
				this.emit('close')
			}
		}
		return connected
	}
}
module.exports = WebSocket
