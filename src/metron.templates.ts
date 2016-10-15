
namespace metron {
    export namespace templates {
        export namespace list {
            export function row<T>(template: string, item: T): string {
                var result = template;
                for (let k in item) {
                    if(item.hasOwnProperty(k)) {
                        let replacement = `{{${k}}}`;
                        result = result.replace(new RegExp(replacement, "g"), item[k]);
                    }
                }
                return result;
            }
        }
    }
}
