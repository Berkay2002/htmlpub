# htmlpub

htmlpub publishes immutable document versions and coordinates review between a person and the agent that produced the document.

## Language

**Document**:
A stable, owner-scoped artifact whose slug identifies its evolving sequence of versions.
_Avoid_: Report, file

**Version**:
An immutable published snapshot of a document.
_Avoid_: Revision

**Review round**:
The period in which one version is awaiting a single owner decision.
_Avoid_: Session, subscription

**Review comment**:
Owner feedback anchored to selected text in the version under review.
_Avoid_: Annotation, note

**Decision**:
The owner action that closes a review round: accept, request revision, or cancel.
_Avoid_: Status update, completion

**Event cursor**:
A stable position identifying the latest review event observed by a waiting client.
_Avoid_: Offset, page
