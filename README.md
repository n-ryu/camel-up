# camel-up

#### 낙타는 달리고 싶다....

## Quick Start

```zsh
pnpm ts-node ./play.ts
```

## Actions

### `init`

#### `init default`

경기를 디폴트 상태로 세팅합니다. 일반 낙타는 r, y, g, b, p 순으로 0 번 트랙에, 미친 낙타는 w, k 순으로 15 번 트랙에 올라갑니다.

#### `init random`

경기를 무작위 상태로 세팅합니다. 일반 낙타는 0-2번 트랙에, 미친 낙타는 13-15번 트랙에 무작위로 배치됩니다.

#### `init manual (<camel> <track>) * N`

경기를 수동으로 세팅합니다. 7마리 낙타의 위치를 모두 지정해야 하며, 위치를 설정할때는 실제 경기에서의 낙타 이동규칙을 그대로 따릅니다.

### `role <dice> <face>`

주사위를 지정하여 굴립니다. 한 주기 안에 같은 색상의 주사위를 굴릴 수는 없으며, 주사위를 5번 굴리면 확인 후 주사위, 장애물, 배팅 상태가 초기화됩니다.

### `role random`

주사위를 무작위로 굴립니다. 한 주기 안에 같은 색상의 주사위를 굴릴 수는 없으며, 주사위를 5번 굴리면 확인 후 주사위, 장애물, 배팅 상태가 초기화됩니다.

### `trap <1|0|-1> <track>`

장애물을 추가합니다. `1` 은 응원 타일을, `-1` 은 야유 타일을 의미합니다. 장애물 타일은 낙타가 있거나, 장애물이 이미 있거나, 장애물과 바로 인접한 트랙에는 배치할 수 없습니다. `0` 은 이미 있는 장애물 타일을 삭제할 때 사용합니다.

### `set <camel> <track>`

낙타의 위치를 직접 지정하여 옮깁니다. 위치를 설정할때는 실제 경기에서의 낙타 이동규칙을 그대로 따릅니다.
