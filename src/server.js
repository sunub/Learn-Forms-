import express from "express"
import bodyParser from "body-parser"
import cors from "cors"

const app = express()

app.use(express.static("public"))
// public 폴더내에 저장되는 정적인 파일들을 사용할 수 있게끔 설정하는 것이다.
// express.static(root, [options])

app.use(bodyParser.json())
// bodyParser는 express에 존재하는 미들웨어로 JSON, raw와 같은 파일들을 하나의
// 객체로 파싱하여 javascript내에서 사용할 수 있게끔 말들어주는 미들웨어에 해당하고
// bodyParser.json는 json 파일을 하나의 객체로 파싱할 수 있게끔 하는 역할을 한다.

app.use(cors())
// Cross Origin Resource Sharing, 즉 CORS를 사용하기 위하여 선언하는 것이다.
// 제한된 리소스를 도메인 밖의 다른 도메인으로부터 요청할 수 있게 허용하는 구조이다.
// 하지만 Ajax 방식의 요청은 동일 자원 보안 정책에 의해서 금지되어 있다.

// app.put('/api/todos', async (req, res) => {
//     await
// })
