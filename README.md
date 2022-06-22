# Dawgjs

DAWG의 [golang 구현체](https://github.com/smhanov/dawg
)에서 영감을 받아 Typescript로 작성한 DAWG 패키지

## 사용 예시

```ts
import dwag from '@daangn/dawgjs'

const wg = createDawg(['롯데리아', '스타벅스', '당근마켓']);
wg.getLongestPrefix('롯데리아 강남역점') // => "롯데리아"
wg.getLongestPrefix('맥도날드') // => undefined
wg.has('당근마켓') // => true
```
