export enum NotificationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  WEB = 'web',
  PUSH = 'push',
  EMAIL = 'email',
}

export enum NotificationType {
  NEWS_REQUEST = 'news-request',
  NEWS_REQUEST_APPROVAL = 'news-request-approval',
  NEWS_HEADLINE_REQUEST = 'news-headline-request',
  NEWS_HEADLINE_REQUEST_APPROVAL = 'news-headline-request-approval',
  NEWS_BREAK_REQUEST = 'news-break-request',
  NEWS_BREAK_REQUEST_APPROVAL = 'news-break-request-approval',
  REACTION = 'reaction',
  COMMENT = 'comment',
  REPLY = 'reply',
}
