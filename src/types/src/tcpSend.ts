import { Mapping } from './mapping'
import { TSRTimelineObjBase, DeviceType } from '.'

export interface MappingTCPSend extends Mapping {
	device: DeviceType.TCPSEND
}

export interface TcpSendCommandContent {
	message: string
	temporalPriority?: number // default: 0
	/** Commands in the same queue will be sent in order (will wait for the previous to finish before sending next */
	queueId?: string
}

export interface TCPSendOptions {
	makeReadyCommands?: TcpSendCommandContent[]

	host: string
	port: number
	bufferEncoding?: string // encoding of messages, ex 'hex', default is 'utf8'
}

export enum TimelineContentTypeTcp {
	GET = 'get',
	POST = 'post',
	PUT = 'put',
	DELETE = 'delete'
}

export type TimelineObjTCPSendAny = TimelineObjTCPRequest
export interface TimelineObjTCPSendBase extends TSRTimelineObjBase {
	content: {
		deviceType: DeviceType.TCPSEND
		// type: TimelineContentTypeCasparCg
	}
}
export interface TimelineObjTCPRequest extends TimelineObjTCPSendBase {
	content: {
		deviceType: DeviceType.TCPSEND
	} & TcpSendCommandContent
}
