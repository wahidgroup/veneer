import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiEnvelope<T> {
	data: T;
	meta?: {
		timestamp?: string;
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	};
}

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
	intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiEnvelope<unknown>> {
		return next.handle().pipe(
			map((body: unknown) => {
				if (isEnvelope(body)) {
					let meta = body.meta;
					if (meta === undefined) {
						meta = { timestamp: new Date().toISOString() };
					} else if (meta.timestamp === undefined) {
						meta = {
							...meta,
							timestamp: new Date().toISOString(),
						};
					}

					return {
						data: body.data,
						meta,
					};
				}

				return {
					data: body,
					meta: { timestamp: new Date().toISOString() },
				};
			}),
		);
	}
}

function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
	if (body === null || typeof body !== "object") {
		return false;
	}

	return "data" in body;
}
