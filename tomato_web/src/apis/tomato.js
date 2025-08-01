import http_instance from "@/utils/http"

function get_tomatoes() {
    return http_instance({
        url: "read_tomatoes/",
    })
}

function create_tomato(data) {
    return http_instance({
        url: "create_tomato/",
        method: "post",
        data: data,
    })
}

function delete_tomato(data) {
    return http_instance({
        url: "delete_tomato/",
        method: "delete",
        params: data,
    })
}

export { get_tomatoes, create_tomato, delete_tomato }