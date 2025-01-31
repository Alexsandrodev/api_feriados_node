"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feriadosContract = void 0;
const core_1 = require("@ts-rest/core");
const c = (0, core_1.initContract)();
exports.feriadosContract = c.router({
    getFeriado: {
        method: "GET",
        path: "/:codigo_ibge/:data/",
        responses: {
            200: c.type(),
            404: c.type(),
        },
        query: null,
    }
});
//     },
//     adicionarFeriado: {
//         method: "PUT",
//         path: "/:codigo_ibge/:data/",
//         body: c.type<{ name: string }>(), // Defina o tipo correto do body
//         responses: {
//             200: c.type<{ message: string }>(),
//             404: c.type<{ message: string }>(),
//         },
//     },
//     removerFeriado: {
//         method: "DELETE",
//         path: "/:codigo_ibge/:data/",
//         responses: {
//             200: c.type<{ message: string }>(),
//             404: c.type<{ message: string }>(),
//         },
//     },
// });
