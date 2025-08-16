import http_instance from "@/utils/http"

function get_tomatoes() {
    return http_instance({
        url: "tomato/read_tomatoes/",
    })
}

function create_tomato(data) {
    return http_instance({
        url: "tomato/create_tomato/",
        method: "post",
        data: data,
    })
}

function delete_tomato(data) {
    return http_instance({
        url: "tomato/delete_tomato/",
        method: "delete",
        params: data,
    })
}

function update_tomato(tomato_id, data) {
    return http_instance({
        url: `tomato/update_tomato/${tomato_id}`,
        method: "patch",
        data: data,
    })
}

export { get_tomatoes, create_tomato, delete_tomato, update_tomato }